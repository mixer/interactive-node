import { EventEmitter } from 'events';
/**
 * Clock sync's goal is to keep a local clock in sync with a server clock.
 */
export class ClockSync extends EventEmitter {
    public syncTimer: NodeJS.Timer;
    public historyLength: number = 11;
    public deltas: number[] = [];

    constructor(public syncInterval: number = 30 * 1000) {
        super();
    }

    public start(syncFunc: () => Promise<number>): void {
        if (this.syncTimer) {
            this.stop();
        }
        setInterval(
            () => {
                const transmitTime = new Date().getTime();
                syncFunc().then(serverTime => this.processResponse(transmitTime, serverTime));
            },
            this.syncInterval,
        );
    }

    public stop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        this.deltas = [];
    }

    public getDelta(): number {
        const sorted = this.deltas.sort();
        const midPoint = sorted.length / 2;
        if (sorted.length % 2) {
            return sorted[midPoint];
        } else {
            return (sorted[midPoint - 1] + sorted[midPoint]) / 2;
        }
    }

    private processResponse(transmitTime: number, serverTime: number) {
        const recieveTime = new Date().getTime();
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
