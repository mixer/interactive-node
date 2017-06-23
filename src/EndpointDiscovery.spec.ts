import { expect, use } from 'chai';
import * as sinon from 'sinon';

// tslint:disable-next-line:no-require-imports import-name
import chaip = require('chai-as-promised');
use(<any>chaip);

import { EndpointDiscovery } from './EndpointDiscovery';
import { NoInteractiveServersAvailable } from './errors';
import { Requester } from './Requester';

const servers = [
    {
        address: 'ws://foo.bar1/gameClient',
    },
    {
        address: 'ws://foo.bar2/gameClient',
    },
    {
        address: 'ws://foo.bar3/gameClient',
    },
];

describe('endpoint discovery', () => {
    const requester = new Requester();
    let stub: sinon.SinonStub;
    const discovery = new EndpointDiscovery(requester);
    beforeEach(() => {
        stub = sinon.stub(requester, 'request');
    });
    afterEach(() => {
        stub.restore();
    });
    it('resolves with a list of endpoints', () => {
        stub.resolves(servers);
        return expect(discovery.retrieveEndpoints()).to.eventually.equal(
            servers,
        );
    });
    it('rejects with a NoInteractiveServersAvailable if the response contains no servers', () => {
        stub.resolves([]);
        return expect(discovery.retrieveEndpoints()).to.be.rejectedWith(
            NoInteractiveServersAvailable,
        );
    });
});
