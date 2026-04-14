import {
  loggerFactory,
  RedstoneCommon,
  RedstoneLogger,
} from '@redstone-finance/utils';
import { clearInterval } from 'node:timers';
import WebSocket, { ClientOptions } from 'ws';
import {
  BackoffOptions,
  HANDSHAKE_TIMEOUT_CLOSE_CODE,
  HeartbeatOptions,
  IsWebSocketClient,
  MessageHandler,
  Millis,
  MSG_TIMEOUT_CLOSE_CODE,
  OnConnectHandler,
  PayloadType,
  ResilientWebSocketOptions,
  ROTATE_CONNECTION_CLOSE_CODE,
  RotationOptions,
  Subscription,
  jitter,
} from './types';
import { Reconnection } from './Reconnection';
import {
  newWebSocketProxy,
  NullWebSocket,
  WebSocketWrapper,
} from './WebSocket';

export class ResilientWebSocketClient implements IsWebSocketClient {
  private readonly url: string;
  private readonly clientId: string;
  private readonly onMessageHandler: MessageHandler;
  private readonly onConnectHandler?: OnConnectHandler;
  private onConnectHandlerDone?: Promise<void> = Promise.resolve();
  private readonly log: RedstoneLogger;
  private ws: WebSocketWrapper;
  private wsOptions?: ClientOptions | undefined;
  private readonly wsConnectionTimeout: Millis;
  private connecting?: Promise<void> | null = null;

  private readonly requestedSubscriptions = new Map<string, Subscription>();

  // heartbeat
  private pingTimer?: NodeJS.Timeout;
  private pongDeadlineTimer?: NodeJS.Timeout;
  private msgAgeCheckTimer?: NodeJS.Timeout;
  private lastMsgTs: Millis = 0;
  private readonly hb: Required<HeartbeatOptions>;

  // backoff
  private readonly backoff: Required<BackoffOptions>;

  // rotation
  private rotationTimer?: NodeJS.Timeout;
  private readonly rotation: Required<RotationOptions>;

  private reconnection: Reconnection;

  constructor(opts: ResilientWebSocketOptions) {
    this.url = opts.url;
    this.clientId = opts.clientId;
    this.onMessageHandler = opts.onMessage;
    this.onConnectHandler = opts.onConnect;
    this.wsOptions = opts.wsOptions;
    this.log = loggerFactory(`ws-client-${this.clientId}`);
    this.ws = new NullWebSocket(this.log, 'initial');

    this.backoff = {
      initial: 500,
      max: 30_000,
      multiplier: 2,
      maxRetries: 100,
      ...(opts.backoff ?? {}),
    };
    this.reconnection = Reconnection.FirstAttempt(this.backoff);

    this.hb = {
      pingInterval: 20_000,
      pongTimeout: 4_000,
      msgTimeout: 30_000,
      customPingPayload: null,
      customPongHandler: null,
      ...(opts.heartbeat ?? {}),
    };

    this.rotation = {
      ttl: 24 * 60 * 60 * 1000,
      ...(opts.rotation ?? {}),
    };

    this.wsConnectionTimeout = opts.handshakeTimeout ?? 10_000;
  }

  close(): void {
    this.ws.close();
  }

  getRequestedSubscriptions(): Set<string> {
    return new Set(this.requestedSubscriptions.keys());
  }

  /** Register a subscription (only if not already subscribed), optionally start connection
   * NOTE: this method should be called inside Fetcher's "fetchData"
   * to "lazily" create websocket connection - since all the Fetchers' instances
   * are currently initialized eagerly :(
   *
   * Drops the subscription request if a reconnection attempt is in progress.
   * It's safe, as subscriptions are re-sent upon every "fetchData" call.
   * Alternatively, we could save sub keys until reconnection is done,
   * but that would add complexity and is probably not worth it.
   */
  async subscribe(sub: Subscription): Promise<void> {
    if (this.reconnection.inProgress()) {
      this.log.debug(
        `reconnection attempt in progress, skipping subscribe(${sub.key})`,
      );
      return;
    }

    await this.connect();
    await this.onConnectHandlerDone;
    this.doSubscribe(sub);
  }

  unsubscribe(key: string): void {
    const sub = this.requestedSubscriptions.get(key);
    if (!sub) {
      return;
    }
    if (sub.buildUnsubscribe && this.ws.isOpen()) {
      this.send(sub.buildUnsubscribe(), PayloadType.PUBLIC);
    }
    this.requestedSubscriptions.delete(key);
  }

  registerPong(): void {
    if (this.pongDeadlineTimer) {
      clearTimeout(this.pongDeadlineTimer);
      this.pongDeadlineTimer = undefined;
    }
  }

  send(payload: string, pt = PayloadType.SECRETS): void {
    if (!this.ws.isOpen()) {
      return;
    }
    try {
      const debugPayload = pt === PayloadType.SECRETS ? '[SECRET]' : payload;
      this.log.debug('ws.send', { payload: debugPayload });
      this.ws.send(payload); // not null checked in isOpen
    } catch (e) {
      this.reportError(e, 'send failed');
    }
  }

  reconnect(wsOptions?: ClientOptions): void {
    if (wsOptions) {
      this.wsOptions = wsOptions;
    }
    this.scheduleRotation(0);
  }

  private doSubscribe(sub: Subscription, resubscribe = false): void {
    if (this.requestedSubscriptions.has(sub.key) && !resubscribe) {
      return;
    }
    this.requestedSubscriptions.set(sub.key, sub);
    this.log.debug('ws.doSubscribe', { sub });
    this.send(sub.buildSubscribe(), PayloadType.PUBLIC);
  }

  private async connect(): Promise<void> {
    if (this.ws.usable()) {
      switch (this.ws.readyState) {
        case WebSocket.OPEN:
          return;
        case WebSocket.CONNECTING:
          if (this.connecting) {
            return await this.connecting;
          }
          break;
        default: // CLOSED/CLOSING
          this.ws = new NullWebSocket(this.log, 'connect');
      }
    }
    if (this.connecting) {
      return await this.connecting;
    }

    this.connecting = new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        if (!this.ws.isOpen()) {
          this.reportError(err, 'ws.handshake.error');
          cleanupHandshake();
          reject(err);
        } else {
          this.reportError(err, 'ws.error');
        }
      };

      this.log.debug('Creating new WebSocket instance');

      // --- Critical section start ---
      // Always set up "error" handler right after creating WebSocket instance.
      // Keep those lines together!
      const wsLocalRef = newWebSocketProxy(this.url, this.wsOptions);
      this.ws = wsLocalRef;
      wsLocalRef.on('error', onError);
      // --- Critical section end ---

      const onHandshakeClose = (code: number) => {
        this.log.debug('Handshake closed');
        cleanupHandshake();
        reject(new Error(`WebSocket closed on handshake (code=${code})`));
      };
      const onOpen = () => {
        if (!this.ws.usable()) {
          return;
        }
        if (this.ws !== wsLocalRef) {
          this.log.warn('Stale ws.onOpen event, ignoring');
          return;
        }

        this.log.info('ws.onOpen', { url: this.url });
        cleanupHandshake();

        // register connection lifetime listeners
        this.ws.on('ping', onPing);
        this.ws.on('pong', onPong);
        this.ws.on('message', (data: WebSocket.RawData) => {
          try {
            this.lastMsgTs = Date.now();
            this.onMessageHandler(data, this);
          } catch (e) {
            this.reportError(e as Error, 'onMessage failed');
          }
        });
        this.ws.on('close', (code: number, reason: Buffer) =>
          this.handleClose(code, reason),
        );
        this.scheduleRotation();

        this.onConnectHandlerDone = new Promise<void>(
          (resolveConnectHandler, rejectConnectHandler) => {
            if (this.onConnectHandler !== undefined) {
              this.onConnectHandler(
                this,
                resolveConnectHandler,
                rejectConnectHandler,
              );
            } else {
              resolveConnectHandler();
            }
          },
        )
          .then(() => {
            this.startHeartbeat();
            for (const sub of this.requestedSubscriptions.values()) {
              this.doSubscribe(sub, true);
            }
          })
          .catch((err) => {
            this.log.error(
              `Connect handler error: ${RedstoneCommon.stringifyError(err)}`,
            );
          })
          .finally(() => {
            this.onConnectHandlerDone = Promise.resolve();
          });

        resolve();
      };

      // only for initial connection handshake
      wsLocalRef.once('open', onOpen);
      wsLocalRef.once('close', onHandshakeClose);

      const handshakeTimer = setTimeout(() => {
        this.log.debug('Handshake timeout');
        try {
          this.safeClose(HANDSHAKE_TIMEOUT_CLOSE_CODE);
        } catch (err) {
          this.log.debug('Handshake close error');
          this.reportError(err as Error);
        } finally {
          cleanupHandshake();
          reject(new Error('WebSocket connect timeout'));
        }
      }, this.wsConnectionTimeout);

      const cleanupHandshake = () => {
        clearTimeout(handshakeTimer);
        if (this.ws.usable()) {
          this.ws.off('open', onOpen);
          this.ws.off('close', onHandshakeClose);
          // if cleanup on handshake error
          if (!this.ws.isOpen()) {
            this.ws = new NullWebSocket(this.log, 'cleanupHandshake');
          }
        }
        this.log.debug('this.connecting = null');
        this.connecting = null;
      };

      const onPing = (data: Buffer) => {
        if (!this.ws.usable()) {
          return;
        }
        this.lastMsgTs = Date.now();
        try {
          this.ws.pong(data);
        } catch (e) {
          this.reportError(e as Error, 'pong frame error');
        }
      };

      const onPong = () => {
        this.lastMsgTs = Date.now();
        this.registerPong();
      };
    });

    this.log.debug('After this.connecting', this.connecting);

    return await this.connecting;
  }

  private startHeartbeat(): void {
    if (!this.ws.usable()) {
      return;
    }
    this.log.debug('starting heartbeat');

    const doPing = () => {
      if (!this.ws.isOpen()) {
        return;
      }
      try {
        if (this.hb.customPingPayload) {
          const p = this.hb.customPingPayload();
          this.send(p, PayloadType.PUBLIC);
        } else {
          this.ws.ping();
        }
        if (this.hb.pongTimeout > 0) {
          this.pongDeadlineTimer = setTimeout(() => {
            this.log.warn('ws.pong.timeout');
            if (this.ws.usable()) {
              this.ws.terminate();
            }
          }, this.hb.pongTimeout).unref();
        }
      } catch (e) {
        this.reportError(e as Error, 'ping failed');
      }
    };

    if (this.hb.pingInterval > 0) {
      // Kick off quickly to detect dead links
      doPing();
      this.pingTimer = setInterval(doPing, this.hb.pingInterval).unref();
    }

    this.lastMsgTs = Date.now();
    this.msgAgeCheckTimer = this.safeInterval(() => {
      const now = Date.now();
      if (now - this.lastMsgTs > this.hb.msgTimeout) {
        if (this.ws.isOpen()) {
          this.log.warn('ws.msgAgeCheckTimer', { afterMs: this.hb.msgTimeout });
          this.safeClose(MSG_TIMEOUT_CLOSE_CODE);
        }
      }
    }, this.hb.msgTimeout).unref();
  }

  private safeClose(closeCode: number, data?: string) {
    if (!this.ws.usable()) {
      return;
    }
    if (this.ws.readyState === WebSocket.CONNECTING) {
      this.log.warn('ws.safeClose - tried to call ws.close while connecting', {
        closeCode,
      });
      // It's important to terminate, as otherwise we might leak connections in CONNECTING state.
      // Such case might happen if a server hangs during handshake for long enough, that we hit our own timeouts.
      // Unfortunately it will throw an error, by design.
      // So it's very important to set up on error handler as soon as possible after creating WebSocket instance.
      this.ws.terminate();
      return;
    }
    this.ws.close(closeCode, data);
  }

  private scheduleRotation(ttl = this.rotation.ttl): void {
    const base = ttl;
    // base value is "big" (usually ~24h), so jitter also kinda "big"
    const jitterVal = ttl === 0 ? 0 : jitter(30, 60);
    const ms = base + jitterVal;
    this.clearRotationTimer();
    this.rotationTimer = this.safeTimeout(() => {
      if (this.ws.isOpen()) {
        this.log.info('ws.rotate', { afterMs: ms });
        this.safeClose(ROTATE_CONNECTION_CLOSE_CODE, 'rotate-ttl');
      }
    }, ms);
    this.rotationTimer.unref();
  }

  private clearRotationTimer(): void {
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
    }
    this.rotationTimer = undefined;
  }

  private clearTimers(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }
    if (this.pongDeadlineTimer) {
      clearTimeout(this.pongDeadlineTimer);
    }
    if (this.msgAgeCheckTimer) {
      clearInterval(this.msgAgeCheckTimer);
    }
    this.clearRotationTimer();
    this.pingTimer = undefined;
    this.pongDeadlineTimer = undefined;
    this.msgAgeCheckTimer = undefined;
    this.lastMsgTs = 0;
  }

  private scheduleReconnect(): void {
    if (this.reconnection.inProgress()) {
      this.log.debug('reconnection already in progress, skipping');
      return;
    }
    this.reconnection = this.reconnection.inferNext();
    if (this.reconnection.maxRetriesExceeded) {
      this.log.warn('ws.scheduleReconnect max retries exceeded');
      return;
    }

    this.log.info('ws.reconnect.scheduled', {
      inMs: this.reconnection.delayMs,
      retryCount: this.reconnection.retryCount,
    });

    this.safeTimeout(() => {
      this.connect().catch((e: Error) => {
        this.reportError(e, 'reconnect failed');
        this.connecting = null;
        this.ws = new NullWebSocket(this.log, 'reconnect catch');
        this.clearTimers();
        this.scheduleReconnect();
      });
    }, this.reconnection.delayMs);
  }

  private reportError(err: unknown, note?: string): void {
    this.log.error(
      `ws.error:${note ?? ''}`,
      RedstoneCommon.stringifyError(err),
    );
  }

  private handleClose(code: number, reason: Buffer) {
    this.log.info('ws.handleClose', { code, reason: reason.toString() });
    this.ws = new NullWebSocket(this.log, 'handleClose');
    this.clearTimers();
    this.scheduleReconnect();
  }

  private safeInterval(fn: () => unknown, ms: Millis) {
    return setInterval(() => {
      try {
        fn();
      } catch (e) {
        this.log.error(RedstoneCommon.stringifyError(e));
      }
    }, ms);
  }

  private safeTimeout(fn: () => unknown, ms: Millis) {
    return setTimeout(() => {
      try {
        fn();
      } catch (e) {
        this.log.error(RedstoneCommon.stringifyError(e));
      }
    }, ms);
  }
}
