/* tslint:disable:no-console */
import * as faker from 'faker';
import * as WebSocket from 'ws';

import {
    GameClient,
    IButton,
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

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
}).then(() => {
    // Now we can create the controls, We need to add them to a scene though.
    // Every Interactive Experience has a "default" scene so we'll add them there there.
    return client.createControls({
        sceneID: 'default',
        controls: makeControls(5, i => `Button ${i}`),
    });
}).then(() => client.ready(true))
.then(() => chaos());

function getControl(id: string): IButton {
    return <IButton> client.state.getControl(id);
}
const updateTime = 20;

function chaos() {
    getControl('1').setProgress(Math.random());
    getControl('2').setCost(Math.floor(Math.random() * 10));
    getControl('3').setText(`${faker.hacker.verb()} it`);
    if (Math.random() < 0.5) {
        getControl('4').disable();
    } else {
        getControl('4').enable();
    }
    setTimeout(() => chaos(), updateTime);
}


/* tslint:enable:no-console */
