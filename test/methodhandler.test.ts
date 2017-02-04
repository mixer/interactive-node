import { expect } from 'chai';

import { InteractiveError } from '../src/errors';
import { MethodHandlerManager } from '../src/methodhandler';
import { IRawValues, Method, Reply } from '../src/packets';

describe('method handler', () => {
    let handler: MethodHandlerManager;
    beforeEach(() => {
        handler = new MethodHandlerManager();
    });

    it('handles a registered method', () => {
        handler.addHandler<IRawValues>('hello', (method: Method<IRawValues>) => {
            return Promise.resolve(method.reply({bar: 'foo'}, null));
        });

        return handler
            .handle(new Method('hello', {foo: 'bar'}))
            .then((res: Reply) => {
                expect(res.result).to.deep.equal({bar: 'foo'});
            });
    });

    it('throws an error if an undiscardable method has no handler', () => {
        return handler
            .handle(new Method('hello', {foo: 'bar'}, false))
            .catch((err: InteractiveError.Base) => {
                expect(err).to.be.an.instanceof(InteractiveError.UnknownMethodName);
            });
    });

    it('does throws an error if a discardable method has no handler', () => {
        return handler
            .handle(new Method('hello', {foo: 'bar'}, true));
    });
});
