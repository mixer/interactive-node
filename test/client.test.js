const Websocket = require('ws');

const clientModule = require('../lib/client');
clientModule.Client.Websocket = Websocket;
const port = process.env.SERVER_PORT || 1339;



describe('client', () => {
    const url = `ws://127.0.0.1:${port}/`;
    let client;
    let server;
    let serverWs;

    function awaitConnect (callback) {
        server.once('connection', _ws => {
            ws = _ws;
            callback(ws);
        });
    }
    describe('connecting', () => {
        it('connects', done => {
            client = new clientModule.Client();

            client.setOptions({url});
            server = new Websocket.Server({ port });
            client.open();
            awaitConnect(() => done());
        });

        after(done => {
            if (client) {
                client.close();
                client = null;
            }
            if (server) {
                server.close(done);
                server = null;
            }
        });
    });
})
