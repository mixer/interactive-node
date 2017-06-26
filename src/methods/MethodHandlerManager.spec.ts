import { expect } from 'chai';

import { InteractiveError } from '../errors';
import { IRawValues } from '../interfaces';
import { Method } from '../wire/packets';
import { MethodHandlerManager } from './MethodHandlerManager';

describe('method handler', () => {
    let handler: MethodHandlerManager;
    beforeEach(() => {
        handler = new MethodHandlerManager();
    });

    it('handles a registered method', () => {
        handler.addHandler<
            IRawValues
        >('hello', (method: Method<IRawValues>) => {
            return method.reply({ bar: 'foo' }, null);
        });

        const reply = handler.handle(new Method('hello', { foo: 'bar' }));
        expect(reply).to.exist;
        if (reply) {
            expect(reply.result).to.deep.equal({ bar: 'foo' });
        }
    });

    it('throws an error if an undiscardable method has no handler', () => {
        expect(() =>
            handler.handle(new Method('hello', { foo: 'bar' }, false)),
        ).to.throw(InteractiveError.UnknownMethodName);
    });

    it('does throws an error if a discardable method has no handler', () => {
        handler.handle(new Method('hello', { foo: 'bar' }, true));
    });
});
