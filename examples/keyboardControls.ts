/* tslint:disable:no-console */
import * as WebSocket from 'ws';
import { getGridPlacement } from './util';

import {
    GameClient,
    IButton,
    IButtonData,
    setWebSocket,
} from '../lib';

if (process.argv.length < 3) {
    console.log('Usage: node keyboardControls.js <token> <versionId>');
    process.exit();
}

// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

// Log when we're connected to interactive
client.on('open', () => console.log('Connected to interactive'));



/**
 * These are our controls. The "keyCode" property is the JavaScript key code associated
 * with the key that participants will press on their keyboard to trigger the button.
 */
const controls: IButtonData[] = [
    {
        controlID: 'up',
        kind: 'button',
        text: 'W',
        keyCode: 87,
        position: getGridPlacement(1, 0),
    },
    {
        controlID: 'left',
        kind: 'button',
        text: 'A',
        keyCode: 65,
        position: getGridPlacement(0, 1),
    },
    {
        controlID: 'down',
        kind: 'button',
        text: 'S',
        keyCode: 83,
        position: getGridPlacement(1, 1),
    },
    {
        controlID: 'right',
        kind: 'button',
        text: 'D',
        keyCode: 68,
        position: getGridPlacement(2, 1),
    },
];

// Opens the connection by passing in our authentication details and a versionId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
})
.then(() => {
    // Creates the controls on the default scene, "default".
    return client.createControls({
        sceneID: 'default',
        controls,
    });
})
.then(buttons => {
    // Now that our controls are created, we can add some event listeners to each.
    buttons.forEach((control: IButton) => {
        control.on('keydown', (inputEvent, participant) => {
            console.log(`${participant.username} pressed ${inputEvent.input.controlID} with their keyboard.`);
        });

        control.on('keyup', (inputEvent, participant) => {
            console.log(`${participant.username} released ${inputEvent.input.controlID} with their keyboard.`);
        });

        control.on('mousedown', (inputEvent, participant) => {
            console.log(`${participant.username} pressed ${inputEvent.input.controlID} with their mouse.`);
        });

        control.on('mouseup', (inputEvent, participant) => {
            console.log(`${participant.username} released ${inputEvent.input.controlID} with their mouse.`);
        });
    });

    // Controls don't appear unless we tell Interactive that we are ready!
    client.ready(true);
});
