import fetch,{ Request, Response, RequestInit } from 'node-fetch'; //tslint:disable-line

const fetchCookie: (url: string | Request, init?: RequestInit) => Promise<Response> = require('fetch-cookie')(fetch); //tslint:disable-line

const BASE = 'https://beam.pro/api/v1/';

function buildURL(url: string): string {
    return BASE + url;
}

export function request(method: string, url: string, body: Object): Promise<Response> {
    return fetchCookie(
        buildURL(url),
        {
            method,
            body: JSON.stringify(body),
        },
    );
}
