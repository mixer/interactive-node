/**
 * A ReconnectionPolicy describes how long to wait before attempting to
 * reconnect to the websocket if the connection drops.
 */
export interface ReconnectionPolicy {
  /**
   * next provides the next reconnect delay, in ms.
   */
  next(): number

  /**
   * Resets an internal counter of reconnection's, should be called on a successful connection.
   */
  reset()
}

/**
 * The ExponentialReconnectionPolicy is a policy which reconnects the socket
 * on a delay specified by the equation min(maxDelay, attempts^2 * baseDelay).
 */
export class ExponentialReconnectionPolicy implements ReconnectionPolicy {
  private retries: number = 0;

  /**
   * @param {Number} maxDelay maximum duration to wait between reconnection attempts
   * @param {Number} baseDelay delay, in milliseconds, to use in
   */
  constructor(public maxDelay: number = 20 * 1000, public baseDelay: number = 500) {}

  next(): number {
    return Math.min(this.maxDelay, (1 << (this.retries++)) * this.baseDelay);
  }

  reset() {
    this.retries = 0;
  }
}
