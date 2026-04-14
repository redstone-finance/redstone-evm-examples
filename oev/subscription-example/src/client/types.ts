import WebSocket, { ClientOptions } from 'ws';

export const HANDSHAKE_TIMEOUT_CLOSE_CODE = 3000;
export const STOP_CLOSE_CODE = 3001;
export const MSG_TIMEOUT_CLOSE_CODE = 3002;
export const ROTATE_CONNECTION_CLOSE_CODE = 3003;

export type Millis = number;

export interface BackoffOptions {
  initial: Millis; // e.g. 500
  max: Millis; // e.g. 30_000
  multiplier: number; // e.g. 2
  maxRetries: number; // max connection retries, e.g. 20
}

export interface HeartbeatOptions {
  pingInterval: Millis; // e.g. 20_000
  pongTimeout: Millis; // e.g. 8_000
  msgTimeout: Millis; // e.g. 5_000 - max time between incoming messages
  // custom ping message for exchanges that do not support native ping/pong frames
  customPingPayload?: (() => string) | null;
  // custom pong message for exchanges that do not support native ping/pong frames
  customPongHandler?: ((pingData: RawMessage) => string) | null;
}

export interface RotationOptions {
  ttl: Millis; // e.g. 24 * 60 * 60 * 1000
}

export type RawMessage = WebSocket.RawData;

export type MessageHandler = (
  data: RawMessage,
  client: IsWebSocketClient,
) => void;

export type Resolve<T> = () => T;

//eslint-disable-next-line @typescript-eslint/no-explicit-any -- that is how the type is defined in lib.es2015.promise.d.ts
export type Reject = (reason?: any) => void;

export const noop = () => {};

export type SetupCallback = () => void;

export type OnConnectHandler = (
  client: IsWebSocketClient,
  setupDone: SetupCallback,
  setupFailed: SetupCallback,
) => void;

export interface ResilientWebSocketOptions {
  url: string;
  clientId: string;
  wsOptions?: ClientOptions;
  backoff?: Partial<BackoffOptions>;
  heartbeat?: Partial<HeartbeatOptions>;
  rotation?: Partial<RotationOptions>;
  onMessage: MessageHandler;
  onConnect?: OnConnectHandler;
  handshakeTimeout?: Millis; // e.g. 10_000 - max time to establish connection
}

// A subscription that is (re)send on connect/reconnect.
export interface Subscription {
  // Unique key to deduplicate subscriptions (e.g., "trades:BTC-USDT").
  key: string;
  // Build the outbound subscribe frame (or array of frames).
  buildSubscribe: () => string;
  // Build the outbound unsubscribe frame (optional, used by `stop`).
  buildUnsubscribe?: () => string;
}

export enum PayloadType {
  SECRETS,
  PUBLIC,
}

export interface IsWebSocketClient {
  getRequestedSubscriptions(): Set<string>;
  subscribe(sub: Subscription): Promise<void>;
  unsubscribe(key: string): void;
  send(payload: string, pt: PayloadType): void;
  registerPong(): void;
  reconnect(wsOptions?: ClientOptions): void;
  close(): void;
}

// Factory method type for creating WebSocket clients.
// Using this in fetcher constructors allows injection for easier testing.
export type WSClientCreator = (
  opts: ResilientWebSocketOptions,
) => IsWebSocketClient;

export function jitter(minSeconds: number, maxSeconds: number): number {
  const randomSeconds =
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return randomSeconds * 1000;
}

export const secsToMs = (secs: number) => secs * 1_000;
