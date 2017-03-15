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

const client = new GameClient();
client.on('open', () => console.log('Connected to interactive'));
// client.on('message', (err: any) => console.log('<<<', err));
// client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

client.open({
    authToken: process.argv[2],
    url: process.argv[3] || 'wss://interactive1-dal.beam.pro',
    experienceId: parseInt(process.argv[4], 10) || 3419,
});

function makeControls(amount: number): IControlData[] {
    const controls: IButtonData[] = [];
    const size = 10;
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: `Button ${i}`,
            position: [
                   {
                       size: 'large',
                       width: size,
                       height: size / 2,
                       x: i * size,
                       y: 1,
                   },
                   {
                       size: 'small',
                       width: size,
                       height: size / 2,
                       x: i * size,
                       y: 1,
                   },
                   {
                       size: 'medium',
                       width: size,
                       height: size,
                       x: i * size,
                       y: 1,
                   },
               ],
            },
        );
    }
    return controls;
}

client.createControls({
    sceneID: 'default',
    controls: makeControls(5),
}).then(controls => {
    controls.forEach(control => {
        control.on('mousedown', (inputEvent: IInputEvent, participant: IParticipant) => {
            console.log(`${participant.username} pushed, ${inputEvent.input.controlID}`);
        });
    });
    client.ready(true);
});
/* tslint:enable:no-console */
