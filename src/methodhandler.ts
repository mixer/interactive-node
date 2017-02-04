import { InteractiveError } from './errors';
import { onReadyParams } from './methodTypes';
import { Method, Reply } from './packets';

export interface IMethodHandler<T> {
    (method: Method<T>) : Promise<Reply | null>;
}

export class MethodHandlerManager {
    private handlers: {[key: string]: IMethodHandler<any>} = {};

    public addHandler(method: 'onReady', handler: IMethodHandler<onReadyParams>): void;
    public addHandler<T>(method: string, handler: IMethodHandler<T>): void;
    public addHandler(method: string, handler: IMethodHandler<any>): void {
        this.handlers[method] = handler;
    }

    public removeHandler(method: string) {
        delete this.handlers[method];
    }

    public handle<T>(method: Method<T>): Promise<Reply | null> {
        if (this.handlers[method.method]) {
            return this.handlers[method.method](method);
        }
        /**
         * When Discard is true a reply is not required,
         * If an error occurs though, we expect the client to tell
         * the server about it.
         *
         * So in the case of a missing method handler, resolve with no reply
         * if discard is true, otherwise throw UnknownMethodName
         */
        if (method.discard) {
            return Promise.resolve(null);
        } else {
            return Promise.reject(new InteractiveError.UnknownMethodName(''));
        }
    }
}
