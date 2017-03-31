import { expect } from 'chai';

import * as utils from './util';

describe('merge', () => {
    it('Handles control meta properties', () => {
        const control = {};
        const data = {
            meta: {
                glow: {
                    value: true,
                    etag: 'hello',
                },
            },
        };

        const result = utils.merge(control, data);
        expect(result).to.deep.equal(data);
    });
});
