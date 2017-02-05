import { expect } from 'chai';

import { InteractiveError } from '../src/errors';
describe('errors', () => {
    it('creates expected error from socket message', () => {
        expect(
            InteractiveError.fromSocketMessage({code: 4000, message: 'potato'}),
        ).to.be.an.instanceof(InteractiveError.InvalidPayload);
    });
});
