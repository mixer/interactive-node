import { expect } from 'chai';
import * as sinon from 'sinon';
import * as WebSocket from 'ws';
import { setWebSocket } from './';
import { Client, ClientType } from './Client';
import { IClient } from './IClient';
import { Method } from './wire/packets';

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
        } else {
            done();
        }
    }
    describe('connecting', () => {
        it('connects', done => {
            client = createClient();

            server = new WebSocket.Server({ port });
            client.open(socketOptions);
            awaitConnect(() => {
                ws.close(1000, 'Normal');
                done();
            });
        });
    });

    describe('method handling', () => {
        it('handles hello', done => {
            client = createClient();
            client.on('hello', () => {
                done();
            });
            client.processMethod(new Method('hello', {}, true, 0));
        });
    });

    describe('state synchronization', () => {
        let mockClient: IClient;
        beforeEach(() => {
            client = createClient();
            client.execute = sinon.stub().returns(new Promise(resolve => { resolve(); }));
            //client.open(socketOptions);
        });
        it('synchronizes scenes', () => {
            const scenes = client.getScenes();
            mockClient = client;
            //const stub = sinon.stub(mockClient, 'execute');
            client.synchronizeScenes();
            expect(client.execute).to.be.calledWith(new Promise(resolve => {resolve(scenes); }));
        });
        it('synchronizes groups', () => {
            const groups = client.getGroups();
            mockClient = client;
            //const stub = sinon.stub(mockClient, 'execute');
            client.synchronizeGroups();
            expect(client.execute).to.be.calledWith(groups);
        });
        it('synchronizes state', () => {
            const scenes = client.getScenes();
            const groups = client.getGroups();
            mockClient = client;
            //const stub = sinon.stub(mockClient, 'execute');
            client.synchronizeState();
            expect(client.execute).to.be.calledWith(scenes);
            expect(client.execute).to.be.calledWith(groups);
        });
    });

    afterEach(done => tearDown(done));
});
