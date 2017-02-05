import { EventEmitter } from 'events';
/**
 * Clock sync's goal is to keep a local clock in sync with a server clock.
 */
export class ClockSync extends EventEmitter {
    private syncTimer: NodeJS.Timer;
    private deltas: number[] = [];
    private syncFunc: () => Promise<number>;

    constructor(public syncInterval: number = 30 * 1000, private historyLength: number = 11) {
        super();
    }

    public start(syncFunc: () => Promise<number>): void {
        if (this.syncTimer) {
            this.stop();
        }

        this.syncFunc = syncFunc;

        this.sync();
        setInterval(
            () => {
                this.sync();
            },
            this.syncInterval,
        );
    }

    private sync() {
        const transmitTime = Date.now();
        this.syncFunc().then(serverTime => this.processResponse(transmitTime, serverTime));
    }

    public stop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        this.deltas = [];
    }

    public getDelta(): number {
        if (this.deltas.length === 0) {
            return 0;
        }

        if (this.deltas.length === 1) {
            return this.deltas[0];
        }

        const sorted = this.deltas.slice(0).sort();
        const midPoint = Math.floor(sorted.length / 2);

        if (sorted.length % 2) {
            return sorted[midPoint];
        } else {
            return (sorted[midPoint - 1] + sorted[midPoint]) / 2;
        }
    }

    private processResponse(transmitTime: number, serverTime: number) {
        const recieveTime = Date.now();
        const rtt = recieveTime - transmitTime;
        const delta = serverTime - (rtt / 2) - transmitTime;
        this.addDelta(delta);
    }

    private addDelta(delta: number) {
        if (this.deltas.length === this.historyLength) {
            //Remove oldest
            this.deltas.shift();
        }
        //Add new one
        this.deltas.push(delta);
        this.emit('delta', this.getDelta());
    }
}
