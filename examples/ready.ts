/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import {
    GameClient,
    IButton,
    IParticipant,
    setWebSocket,
} from '../lib';

import { makeControls } from './util';

if (process.argv.length < 4) {
    console.log('Usage gameClient.exe <token> <versionId>');
    process.exit();
}
// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

// Log when we're connected to interactive
client.on('open', () => console.log('Connected to interactive'));

// These can be un-commented to see the raw JSON messages under the hood
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
}).then(() => {
    // Controls don't appear unless we tell Interactive that we are ready!
    return client.ready(true);
});

/* tslint:enable:no-console */
