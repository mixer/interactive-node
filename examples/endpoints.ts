import fetch from 'node-fetch'; //tslint:disable-line import-name

export interface IInteractiveEndpoint {
    address: string;
}

const base = 'https://beam.pro/api/v1/';

const endpoint = `${base}/interactive/hosts`;

export function getInteractiveEndpoints(): Promise<IInteractiveEndpoint[]> {
    return fetch(endpoint)
    .then(res => res.json<IInteractiveEndpoint[]>());
}
