import * as https from 'https';

import { NoInteractiveServersAvailable, TimeoutError } from '../src/errors';

export interface IInteractiveEndpoint {
    address: string;
}

const endpoint = `https://beam.pro/api/v1/interactive/hosts`;

/**
 * Retrieves available interactive servers from Beam's REST API.
 * Game Clients should connect to the first one in the list and use
 * other servers in the list should a connection attempt fail.
 */
export function getInteractiveEndpoints(): Promise<IInteractiveEndpoint[]> {
    return makeRequest<IInteractiveEndpoint[]>(endpoint).then(res => {
        if (res.length > 0) {
            return res;
        }
        return new NoInteractiveServersAvailable('No Interactive servers are available, please try again.');
    });
}

export function makeRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            let body = '';
            res.on('data', str => body = body + str.toString());
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.setTimeout(15 * 1000); //tslint:disable-line
        req.on('error', err => reject(err));
        req.on('timeout', () => reject(new TimeoutError('Request timed out')));
    });
}
