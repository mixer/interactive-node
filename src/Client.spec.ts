import { expect } from 'chai';
import * as sinon from 'sinon';
import * as WebSocket from 'ws';

import { setWebSocket } from './';
import { Client, ClientType } from './Client';
import { IGroupData, ISceneData } from './state/interfaces';
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
        after(done => tearDown(done));
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
        let executeStub: sinon.SinonStub;
        const scenes: ISceneData[] = [{ sceneID: 'default', controls: [] }];
        const groups: IGroupData[] = [{ groupID: 'default' }];

        beforeEach(() => {
            client = createClient();
            executeStub = sinon.stub(client, 'execute');
        });
        afterEach(() => {
            executeStub.restore();
        });

        it('synchronizes scenes', () => {
            executeStub.onCall(0).resolves(scenes);
            const syncScenesStub = sinon.stub(
                client.state,
                'synchronizeScenes',
            );
            return client.synchronizeScenes().then(() => {
                expect(syncScenesStub).to.have.been.calledWith(scenes);

                syncScenesStub.restore();
            });
        });

        it('synchronizes groups', () => {
            executeStub.onCall(0).resolves(groups);
            const syncGroupsStub = sinon.stub(
                client.state,
                'synchronizeGroups',
            );
            return client.synchronizeGroups().then(() => {
                expect(syncGroupsStub).to.have.been.calledWith(groups);

                syncGroupsStub.restore();
            });
        });

        it('synchronizes state', () => {
            executeStub.withArgs('getGroups', null, false).resolves(groups);
            executeStub.withArgs('getScenes', null, false).resolves(scenes);
            const syncGroupsStub = sinon.stub(
                client.state,
                'synchronizeGroups',
            );
            const syncScenesStub = sinon.stub(
                client.state,
                'synchronizeScenes',
            );
            return client.synchronizeState().then(() => {
                expect(syncScenesStub).to.have.been.calledWith(scenes);
                expect(syncGroupsStub).to.have.been.calledWith(groups);

                syncGroupsStub.restore();
                syncScenesStub.restore();
            });
        });
    });
});
