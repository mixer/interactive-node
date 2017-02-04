import * as WebSocket from 'ws';

import { Client } from '../src/client';

Client.WebSocket = WebSocket;
const port = process.env.SERVER_PORT || 1339;

describe('client', () => {
    const url = `ws://127.0.0.1:${port}/`;
    let client: Client;
    let server: WebSocket.Server;
    let ws: WebSocket;

    function awaitConnect(callback: Function) {
        server.once('connection', (_ws: WebSocket) => {
            ws = _ws;
            callback(ws);
        });
    }
    describe('connecting', () => {
        it('connects', done => {
            client = new Client();

            client.setOptions({url});
            server = new WebSocket.Server({ port });
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
});
