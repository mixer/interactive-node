/**
 * A ReconnectionPolicy describes how long to wait before attempting to
 * reconnect to the websocket if the connection drops.
 */
export interface IReconnectionPolicy {
    /**
   * next provides the next reconnect delay, in ms.
   */
    next(): number;

    /**
   * Resets an internal counter of reconnection attempts, should be called on a successful connection.
   */
    reset(): void;
}

/**
 * The ExponentialReconnectionPolicy is a policy which reconnects the socket
 * on a delay specified by the equation min(maxDelay, attempts^2 * baseDelay).
 */
export class ExponentialReconnectionPolicy implements IReconnectionPolicy {
    private retries: number = 0;

    /**
   * @param {Number} maxDelay maximum duration to wait between reconnection attempts
   * @param {Number} baseDelay delay, in milliseconds, to use in
   */
    constructor(
        public maxDelay: number = 20 * 1000,
        public baseDelay: number = 500,
    ) {}

    public next(): number {
        // tslint:disable-next-line:no-bitwise
        return Math.min(this.maxDelay, (1 << this.retries++) * this.baseDelay);
    }

    public reset() {
        this.retries = 0;
    }
}
