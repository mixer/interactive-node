import { expect } from 'chai';

import { InteractiveError } from '../src/errors';
import { MethodHandlerManager } from '../src/methodhandler';
import { Method } from '../src/packets';

describe('method handler', () => {
    let handler;
    beforeEach(() => {
        handler = new MethodHandlerManager();
    });

    it('handles a registered method', () => {
        handler.addHandler('hello', method => Promise.resolve('hi'));

        return handler
            .handle(new Method('hello', {foo: 'bar'}))
            .then(res => {
                expect(res).to.equal('hi');
            });
    });

    it('throws an error if an undiscardable method has no handler', () => {
        return handler
            .handle(new Method('hello', {foo: 'bar'}, false))
            .catch(err => {
                expect(err).to.be.an.instanceof(InteractiveError.UnknownMethodName);
            });
    });

    it('does throws an error if a discardable method has no handler', () => {
        return handler
            .handle(new Method('hello', {foo: 'bar'}, true));
    });
});
