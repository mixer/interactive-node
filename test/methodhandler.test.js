const methodHandler = require('../lib/methodhandler');
const packets = require('../lib/packets');

describe('method handler', () => {
    it('handles a registered method', () => {
        const handler = new methodHandler.MethodHandlerManager();
        handler.addHandler('hello', method => { return Promise.resolve('hi')});

        return handler
            .handle(new packets.Method('hello', {foo: 'bar'}))
            .then(res => {
                expect(res).to.equal('hi');
            })
    })
});
