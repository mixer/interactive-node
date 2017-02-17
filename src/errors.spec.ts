import { expect } from 'chai';

import { InteractiveError } from './errors';
describe('errors', () => {
    it('creates expected error from socket message', () => {
        const err = new InteractiveError.InvalidPayload('potato');
        expect(err).to.be.an.instanceof(InteractiveError.InvalidPayload);
    });
});
