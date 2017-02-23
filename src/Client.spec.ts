import * as WebSocket from 'ws';
import { setWebSocket } from './';

import { Client, ClientType } from './Client';

setWebSocket(WebSocket);
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

    const socketOptions = {
        url,
    };
    function createClient(): Client {
        return new Client(ClientType.GameClient);
    }
    function tearDown(done: (err?: any) => void) {
        if (client) {
            client.close();
            client = null;
        }
        if (server) {
            server.close(done);
            server = null;
        }
    }
    describe('connecting', () => {
        it('connects', done => {
            client = createClient();

            server = new WebSocket.Server({ port });
            client.open(socketOptions);
            awaitConnect(() => done());
        });
    });

    afterEach(done => tearDown(done));
});
