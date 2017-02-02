const methodHandler = require('../lib/methodhandler');
const packets = require('../lib/packets');
const Errors = require('../lib/errors');

describe('method handler', () => {
    let handler;
    beforeEach(() => {
        handler = new methodHandler.MethodHandlerManager();
    });

    it('handles a registered method', () => {
        handler.addHandler('hello', method => { return Promise.resolve('hi')});

        return handler
            .handle(new packets.Method('hello', {foo: 'bar'}))
            .then(res => {
                expect(res).to.equal('hi');
            })
    });

    it('throws an error if an undiscardable method has no handler', () => {
        return handler
            .handle(new packets.Method('hello', {foo: 'bar'}, false))
            .catch(err => {
                expect(err).to.be.an.instanceof(Errors.InteractiveError.UnknownMethodName);
            })
    });

    it('does throws an error if a discardable method has no handler', () => {
        return handler
            .handle(new packets.Method('hello', {foo: 'bar'}, true));
    })
});
