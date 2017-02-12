import { EventEmitter } from 'events';

import { delay } from './util';

export interface IClockSyncOptions {
    // How often should we check for a sync status
    checkInterval?: number;
    // When retrieving a time from the server how many samples should we take?
    sampleSize?: number;
    // If the clock falls this far out of sync, re-sync from the server
    threshold?: number;
    // the function to call to check the server time. Should resolve with the unix timestamp of the server.
    sampleFunc: () => Promise<number>;
    // How long to wait between sampling during a sync call
    sampleDelay?: number;
}

const defaultOptions = {
    checkInterval: 30 * 1000,
    sampleSize: 3,
    threshold: 1000,
    sampleDelay: 5000,
}
/**
 * Clock sync's goal is to keep a local clock in sync with a server clock.
 */
export class ClockSync extends EventEmitter {
    private options: IClockSyncOptions;

    private deltas: number[] = [];
    private cachedDelta: number = null;
    private checkTimer: NodeJS.Timer;
    private expectedTime: number;

    private syncing: Promise<void>;

    constructor(options: IClockSyncOptions) {
        super();
        this.options = Object.assign({}, defaultOptions, options);
    }

    public start(): void {
        this.deltas = [];

        this.sync()
            .then(() => {
                this.expectedTime = Date.now() + this.options.checkInterval;
                this.checkTimer = setInterval(
                    () => this.checkClock(),
                    this.options.checkInterval,
                );
            });
    }

    private checkClock() {
        const now = Date.now();
        const diff = Math.abs(now - this.expectedTime);
        if (diff > this.options.threshold && this.syncing === null) {
            this.sync();
        }
        this.expectedTime = Date.now() + this.options.checkInterval;
    }

    public sync(): Promise<void> {
        const samplePromises: Promise<number>[] = [];

        for (let i = 0; i < this.options.sampleSize; i++) {
            samplePromises.push(delay(i * this.options.sampleDelay).then(() => this.sample()));
        }
        this.syncing = Promise.all(samplePromises)
            .then(() => {
                this.emit('delta', this.getDelta());
                return undefined;
            });

        return this.syncing
            .then(() => this.syncing = null);
    }

    private sample(): Promise<number> {
        const transmitTime = Date.now();
        return this.options.sampleFunc()
            .then(serverTime => this.processResponse(transmitTime, serverTime));
    }

    public stop() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }
    }

    public getDelta(forceCalculation?: boolean): number {
        if (this.cachedDelta === null || forceCalculation) {
            this.cachedDelta = this.calculateDelta();
        }
        return this.cachedDelta;
    }

    private calculateDelta(): number {
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
            return (sorted[midPoint + 1] + sorted[midPoint]) / 2;
        }
    }

    private processResponse(transmitTime: number, serverTime: number): number {
        const recieveTime = Date.now();
        const rtt = recieveTime - transmitTime;
        const delta = serverTime - (rtt / 2) - transmitTime;
        return this.addDelta(delta);
    }

    private addDelta(delta: number): number {
        //Add new one
        this.deltas.push(delta);

        //Re-calculate delta with this number
        return this.getDelta(true);
    }
}
