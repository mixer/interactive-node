import { expect } from 'chai';
import * as sinon from 'sinon';

import { ClockSync } from './ClockSync';

describe('clock syncer', () => {
    let syncer: ClockSync;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    it('samples the clock delay the specified number of times before emitting a delta', done => {
        const spy = sinon.stub();
        spy.returns(Promise.resolve(1));
        const sampleSize = 3;
        syncer = new ClockSync({
            sampleFunc: spy,
            sampleDelay: 1,
            sampleSize,
        });
        syncer.start();
        clock.tick(sampleSize - 1);
        syncer.on('delta', () => {
            expect(spy).to.have.been.calledThrice;
            done();
        });
    });

    it('emits deltas', done => {
        const artificialDifference = 10 * 1000;
        const tickInterval = 1;

        const spy = sinon.stub();

        spy.returns(Promise.resolve(clock.now + artificialDifference));
        const sampleSize = 3;
        syncer = new ClockSync({
            sampleFunc: spy,
            sampleDelay: 1,
            sampleSize,
        });
        syncer.on('delta', (delta: number) => {
            expect(delta).to.equal(artificialDifference - tickInterval * 2);
            done();
        });
        syncer.start();
        clock.tick(sampleSize - 1);
    });

    afterEach(() => {
        if (syncer) {
            syncer.stop();
            syncer = null;
        }
        clock.restore();
    });
});
