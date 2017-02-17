import * as WebSocket from 'ws';

import * as Interactive from '../src';

Interactive.setWebSocket(WebSocket);

const client = new Interactive.ParticipantClient({
    jwt: '',
    url: 'wss://interactive1-dal.beam.pro?channel=36241',
});
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
client.on('error', (err: any) => console.log(err));

client.open();

