import { InteractiveError } from './errors';
import { Method, Reply } from './packets';

export interface IMethodHandler {
    (method: Method) : Promise<Reply | null>;
}

export class MethodHandlerManager {
    private handlers: {[key: string]: IMethodHandler};

    public addHandler(method: string, handler: IMethodHandler) {
        this.handlers[method] = handler;
    }

    public removeHandler(method: string) {
        delete this.handlers[method];
    }

    public handle(method: Method): Promise<Reply | null> {
        if(this.handlers[method.method]) {
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