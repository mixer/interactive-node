import * as https from 'https';

import { TimeoutError } from '../src/errors';

export interface IInteractiveEndpoint {
    address: string;
}

const endpoint = `https://beam.pro/api/v1/interactive/hosts`;

export function getInteractiveEndpoints(): Promise<IInteractiveEndpoint[]> {
    return makeRequest<IInteractiveEndpoint[]>(endpoint);
}

function makeRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            let body = '';
            res.on('data', str => body = body + str.toString());
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', err => reject(err));
        req.on('timeout', () => reject(new TimeoutError('Request timed out')));
    });
}
