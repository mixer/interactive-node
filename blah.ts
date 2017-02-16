import * as WebSocket from 'ws';

import { Client, ClientType } from './src';

Client.WebSocket = WebSocket;
const client = new Client({
    clientType: ClientType.GameClient,
    socketOptions: {
        url: 'wss://interactive1-dal.beam.pro/gameClient',
        authToken: '',
    },
});
client.on('error', (err: any) => console.log(err));

client.open();

