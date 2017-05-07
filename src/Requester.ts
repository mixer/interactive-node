import * as https from 'https';
import { TimeoutError } from './errors';

export interface IRequester {
    request<T>(url: string ): Promise<T>;
}

export class Requester implements IRequester {
    public request<T>(url: string): Promise<T> {
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
}
