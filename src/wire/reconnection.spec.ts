import { expect } from 'chai';

import { ExponentialReconnectionPolicy } from './reconnection';

// Setting these explicity will mean these tests wont break should we change the defaults
const maxDelay = 20 * 1000;
const baseDelay = 500;

describe('exponential reconnection', () => {
    const policy = new ExponentialReconnectionPolicy(maxDelay, baseDelay);
    beforeEach(() => {
        policy.reset();
    });
    it('starts with the base delay', () => {
        expect(policy.next()).to.equal(baseDelay);
    });
    it('exponentially grows', () => {
        expect(policy.next()).to.equal(baseDelay);
        expect(policy.next()).to.equal(1000);
        policy.next();
        expect(policy.next()).to.equal(4000);
    });
    it('resets', () => {
        expect(policy.next()).to.equal(baseDelay);
        policy.reset();
        expect(policy.next()).to.equal(baseDelay);
    });
});
