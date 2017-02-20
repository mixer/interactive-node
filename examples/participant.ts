import * as WebSocket from 'ws';

import * as Interactive from '../src';

import { request } from './client';

Interactive.setWebSocket(WebSocket);
const auth = {
    username: process.argv[2],
    password: process.argv[3],
};

request('POST', 'users/login', auth)
.then(() => request('POST', 'jwt/authorize', {}))
.then(res => {
    const client = new Interactive.ParticipantClient({
         jwt: res.headers.get('x-jwt'),
         url: 'wss://interactive1-dal.beam.pro/participant',
         channelID: 36241,
    });
    client.on('message', (err: any) => console.log('<<<', err));
    client.on('send', (err: any) => console.log('>>>', err));
    client.on('error', (err: any) => console.log(err));
    client.open();
});

