import { expect } from 'chai';
import * as sinon from 'sinon';
import * as WebSocket from 'ws';
import { setWebSocket } from './';
import { Client, ClientType } from './Client';
import { IGroupData, ISceneData } from './state/interfaces';
import { Method } from './wire/packets';

setWebSocket(WebSocket);
const port: number = parseInt(process.env.SERVER_PORT, 10) || 1339;

describe('client', () => {
    const urls = [`ws://127.0.0.1:${port}/`];
    let client: Client;
    let server: WebSocket.Server;

    const socketOptions = {
        urls,
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
            server.close(() => {
                server.clients.forEach(c => c.close());
                server = null;
                done();
            });
        } else {
            done();
        }
        // console.log(server, client); //tslint:disable-line
    }
    describe('connecting', () => {
        it('connects', () => {
            client = createClient();
            server = new WebSocket.Server({ port });
            return client.open(socketOptions);
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
            const syncScenesStub = sinon.stub(client.state, 'synchronizeScenes');
            return client.synchronizeScenes().then(() => {
                expect(syncScenesStub).to.have.been.calledWith(scenes);

                syncScenesStub.restore();
            });
        });

        it('synchronizes groups', () => {
            executeStub.onCall(0).resolves(groups);
            const syncGroupsStub = sinon.stub(client.state, 'synchronizeGroups');
            return client.synchronizeGroups().then(() => {
                expect(syncGroupsStub).to.have.been.calledWith(groups);

                syncGroupsStub.restore();
            });
        });

        it('synchronizes state', () => {
            executeStub.withArgs('getGroups', null, false).resolves(groups);
            executeStub.withArgs('getScenes', null, false).resolves(scenes);
            const syncGroupsStub = sinon.stub(client.state, 'synchronizeGroups');
            const syncScenesStub = sinon.stub(client.state, 'synchronizeScenes');
            return client.synchronizeState().then(() => {
                expect(syncScenesStub).to.have.been.calledWith(scenes);
                expect(syncGroupsStub).to.have.been.calledWith(groups);

                syncGroupsStub.restore();
                syncScenesStub.restore();
            });
        });
    });
});
