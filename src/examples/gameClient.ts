/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import { IParticipant } from '../state/interfaces';
import { IInputEvent } from '../state/interfaces/controls/IInput';

import {
    GameClient,
    IButtonData,
    IControlData,
    setWebSocket,
} from '../';

if (process.argv.length < 5) {
    console.log('Usage gameClient.exe <token> <url> <experienceId>');
    process.exit();
}

setWebSocket(WebSocket);

const client = new GameClient({
    authToken: process.argv[2],
    url: process.argv[3] || 'wss://interactive1-dal.beam.pro',
    experienceId: parseInt(process.argv[4], 10) || 3419,
});
client.on('open', () => console.log('Connected to interactive'));
// client.on('message', (err: any) => console.log('<<<', err));
// client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

client.open();

function makeControls(amount: number): IControlData[] {
    const controls: IButtonData[] = [];
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: `Button ${i}`,
        });
    }
    return controls;
}

client.createControls({
    sceneID: 'default',
    controls: makeControls(5),
}).then(controls => {
    controls.forEach(control => {
        control.on('mousedown', (_: IInputEvent, participant: IParticipant) => {
            console.log(`${participant.username} pushed me!`);
        });
    });
    client.ready(true);
});
/* tslint:enable:no-console */
