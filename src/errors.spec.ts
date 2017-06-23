import { expect } from 'chai';

import { InteractiveError } from './errors';
const message = 'test';
describe('errors', () => {
    it('creates expected error from socket message', () => {
        const err = new InteractiveError.InvalidPayload(message);
        expect(err).to.be.an.instanceof(InteractiveError.InvalidPayload);
    });
    it('performs an error lookup', () => {
        const err = InteractiveError.fromSocketMessage({ code: 4000, message });
        expect(err).to.be.an.instanceof(InteractiveError.InvalidPayload);
    });
    it('maintains referential integrity', () => {
        Object.keys(InteractiveError.errors).forEach(codeStr => {
            const code = parseInt(codeStr, 10);
            const err = InteractiveError.fromSocketMessage({ code, message });
            expect(err).to.be.an.instanceOf(InteractiveError.errors[code]);
            expect(err.code).to.equal(code);
        });
    });

    it('handles unknown error codes', () => {
        const code = 5000;
        const err = InteractiveError.fromSocketMessage({ code, message });
        expect(err).to.be.an.instanceOf(InteractiveError.Base);
        expect(err.code).to.equal(code);
    });
});
