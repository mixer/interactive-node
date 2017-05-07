import { expect, use } from 'chai';
import * as sinon from 'sinon';

// tslint:disable-next-line:no-require-imports import-name
import chaip = require('chai-as-promised');
use(<any>chaip);

import * as endpoints from './endpoints';

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
    let stub: sinon.SinonStub;
    beforeEach(() => {
        stub = sinon.stub(endpoints, 'makeRequest');
    });
    afterEach(() => {
        stub.restore();
    });
    it('resolves with a list of endpoints', () => {
        stub.resolves(servers);
        expect(endpoints.getInteractiveEndpoints()).to.eventually.equal(servers);
    });


});
