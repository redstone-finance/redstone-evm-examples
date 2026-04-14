/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedstoneLogger } from '@redstone-finance/utils';
import { ClientOptions, WebSocket } from 'ws';

export interface WebSocketWrapper {
  readyState: number;
  usable(): boolean;
  isOpen(): boolean;
  send(payload: string): void;
  on(
    event: string | symbol,
    listener: (this: WebSocket, ...args: any[]) => void,
  ): this;
  once(
    event: string | symbol,
    listener: (this: WebSocket, ...args: any[]) => void,
  ): this;
  off(
    event: string | symbol,
    listener: (this: WebSocket, ...args: any[]) => void,
  ): this;
  pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
  ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
  terminate(): void;
  close(code?: number, data?: string): void;
}

/**
 * A WebSocket null-object implementation that logs all calls to its methods for debugging purposes.
 */
export class NullWebSocket implements WebSocketWrapper {
  readonly errorPrefix: string;

  constructor(
    private readonly log: RedstoneLogger,
    context: string,
  ) {
    this.log.info(`${context}: Created NullWebSocket instance`);
    this.errorPrefix = `[UNCAUGHT_EXCEPTION possibility] null WebSocket(${context}):`;
  }

  usable = () => false;
  isOpen = () => false;

  get readyState(): number {
    return -1;
  }

  send = (payload: string) =>
    this.log.error(
      `${this.errorPrefix} "send" called with payload: ${payload}`,
    );

  on(event: string | symbol, _: (this: WebSocket, ...args: any[]) => void) {
    this.log.error(
      `${this.errorPrefix} "on" called for event: ${String(event)}`,
    );
    return this;
  }

  once(event: string | symbol) {
    this.log.error(
      `${this.errorPrefix} "once" called for event: ${String(event)}`,
    );
    return this;
  }

  off(event: string | symbol) {
    this.log.error(
      `${this.errorPrefix} "off" called for event: ${String(event)}`,
    );
    return this;
  }

  pong(data?: any) {
    this.log.error(`${this.errorPrefix} "pong" called with data: ${data}`);
  }

  ping(data?: any) {
    this.log.error(`${this.errorPrefix} "ping" called with data: ${data}`);
  }

  terminate() {
    this.log.error(`${this.errorPrefix} "terminate" called`);
  }

  close(code?: number, data?: string) {
    this.log.error(
      `${this.errorPrefix} "close" called with code: ${code}, data: ${data}`,
    );
  }
}

export function newWebSocketProxy(
  url: string,
  wsOptions: ClientOptions | undefined,
): WebSocketWrapper {
  const ws = new WebSocket(url, wsOptions);
  return Object.assign(ws, {
    usable: () => true,
    isOpen: () => ws.readyState === WebSocket.OPEN,
  });
}
