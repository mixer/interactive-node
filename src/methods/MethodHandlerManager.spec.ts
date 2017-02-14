import { expect } from 'chai';

import { InteractiveError } from '../errors';
import { IRawValues } from '../interfaces';
import { Method, Reply } from '../wire/packets';
import { MethodHandlerManager } from './MethodHandlerManager';

describe('method handler', () => {
    let handler: MethodHandlerManager;
    beforeEach(() => {
        handler = new MethodHandlerManager();
    });

    it('handles a registered method', () => {
        handler.addHandler<IRawValues>('hello', (method: Method<IRawValues>) => {
            return Promise.resolve(method.reply({bar: 'foo'}, null));
        });

        const promise = handler.handle(new Method('hello', {foo: 'bar'}));
        if (promise) {
            return promise.then((res: Reply) => {
                expect(res.result).to.deep.equal({bar: 'foo'});
            });
        }
        return Promise.reject(new Error('unexpected no reply'));
    });

    it('throws an error if an undiscardable method has no handler', () => {
        const promise = handler.handle(new Method('hello', {foo: 'bar'}, false));
        if (promise) {
            return promise.catch((err: InteractiveError.Base) => {
                expect(err).to.be.an.instanceof(InteractiveError.UnknownMethodName);
            });
        }
        return Promise.reject(new Error('unexpected no reply'));
    });

    it('does throws an error if a discardable method has no handler', () => {
        return handler
            .handle(new Method('hello', {foo: 'bar'}, true));
    });
});
