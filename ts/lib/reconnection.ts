export class ReconnectionPolicy {
  private retries: number = 0;
  private retryWrap: number = 7;

  /**
   * Provide the next reconnect delay, in ms.
   */
  next(): number {
    var power = (this.retries++ % this.retryWrap) + Math.round(Math.random());
    return (1 << power) * 500;
  }

  /**
   * Resets an internal counter of reconnection's, should be called on a successful connection.
   */
  reset() {
    this.retries = 0;
  }
}
