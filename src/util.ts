import { EventEmitter } from 'events';
import { TimeoutError } from './errors';

/**
 * race takes an array of promises and is resolved with the first promise
 * that resolves, or rejects. After the first resolve or rejection, all
 * future resolutions and rejections will be discarded.
 * @param {Promise[]} promises
 * @return {Promise}
 */
export function race (promises: Promise<any>[]): Promise<any> {
    return new Promise<any>((_resolve, _reject) => {
        let done = false;
        function guard (fn: (value: any) => void): (value: any) => void {
            return function (value: any) {
                if (!done) {
                    done = true;
                    fn(value);
                }
            };
        }

        const resolve = guard(_resolve);
        const reject = guard(_reject);
        promises.forEach(p => p.then(resolve).catch(reject));
    });
}

/**
 * Returns a promise that's resolved when an event is emitted on the
 * EventEmitter.
 * @param  {EventEmitter} emitter
 * @param  {string}       event
 * @para   {number}       timeout used to prevent memory leaks
 * @return {Promise<any>}
 */
export function resolveOn(emitter: EventEmitter, event: string,
    timeout: number = 120 * 1000): Promise<any> {

    return new Promise((resolve, reject) => {
        let resolved = false;
        const listener = data => {
            resolved = true;
            resolve(data);
        };

        emitter.once(event, listener);

        setTimeout(() => {
            if (!resolved) {
                emitter.removeListener(event, listener);
                reject(new TimeoutError(`Expected to get event ${event}`));
            }
        }, timeout);
    });
}

/**
 * Return a promise which is rejected with a TimeoutError after the
 * provided delay.
 * @param  {Number} delay
 * @return {Promise}
 */
export function timeout (message: string, delay: number): Promise<void> {
    // Capture the stacktrace here, since timeout stacktraces
    // often get mangled or dropped.
    const err = new TimeoutError(message);

    return new Promise<void>((resolve, reject) => {
        setTimeout(() => reject(err), delay);
    });
}
