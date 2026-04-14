import { BackoffOptions, Millis, jitter, secsToMs } from './types';

export class Reconnection {
  static FirstAttempt = (backoff: Required<BackoffOptions>) =>
    new Reconnection(0, backoff);

  readonly delayMs: Millis = 0;
  readonly scheduledAt: Millis = Date.now();
  readonly maxRetriesExceeded: boolean;

  constructor(
    readonly retryCount: number = 0,
    readonly backoff: Required<BackoffOptions>,
  ) {
    this.delayMs = this.effectiveDelay();
    this.maxRetriesExceeded = this.retryCount >= this.backoff.maxRetries;
  }

  inferNext(): Reconnection {
    const nextRetryCount = this.shouldReset() ? 1 : this.retryCount + 1;
    return new Reconnection(nextRetryCount, this.backoff);
  }

  inProgress(): boolean {
    return this.retryCount > 0 && Date.now() < this.scheduledAt + this.delayMs;
  }

  private effectiveDelay() {
    const delay = Math.min(
      this.backoff.max,
      this.backoff.initial * Math.pow(2, this.retryCount - 1),
    );
    // Add small jitter to avoid synchronized reconnects
    return delay + jitter(1, 5);
  }

  private shouldReset(): boolean {
    const elapsedMs = Date.now() - this.scheduledAt;
    const successfulOperationMinThreshold = secsToMs(5);
    return elapsedMs >= this.delayMs + successfulOperationMinThreshold;
  }
}
