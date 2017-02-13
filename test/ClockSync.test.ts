import { expect } from 'chai';
import * as sinon from 'sinon';

import { ClockSync } from '../src/ClockSync';

describe('clock syncer', () => {
    let syncer: ClockSync;
    let clock: sinon.SinonFakeTimers;

    before(() => {
        clock = sinon.useFakeTimers();
    });

    it('calls a sync function at specified interval', () => {
        const spy = sinon.stub();
        spy.returns(Promise.resolve(1));
        syncer = new ClockSync({
            sampleFunc: spy,
            checkInterval: 10,
        });
        syncer.start();
        clock.tick(10);
        expect(spy).to.have.been.calledOnce;
    });

    it('emits deltas', done => {
        const artificialDifference = 10 * 1000;
        const tickInterval = 10;

        const spy = sinon.stub();

        spy.returns(Promise.resolve(new Date().getTime() + artificialDifference));
        syncer = new ClockSync({
            sampleFunc: spy,
            checkInterval: 10,
        });
        syncer.start();

        syncer.on('delta', (delta: number) => {
            expect(delta).to.equal(artificialDifference - tickInterval);
            done();
        });

        clock.tick(tickInterval * 2);

    });

    afterEach( () => {
        if (syncer) {
            syncer.stop();
            syncer = null;
        }
    });

    after(() => {
        clock.restore();
    });
});
