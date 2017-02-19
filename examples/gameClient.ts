import { IInputEvent } from '../src/state/interfaces/controls/IInput';
import * as WebSocket from 'ws';

import {
    GameClient,
    IButtonData,
    IControlData,
    setWebSocket,
} from '../src';

setWebSocket(WebSocket);

const client = new GameClient({
    authToken: 'Ory24TyaivZFbeGX3MHbx9MexiSxAuWOd6VoSya1J1iwbuu7B96s1NgPNgr8TypQ',
    experienceId: 3419,
    url: 'wss://interactive1-dal.beam.pro',
});
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
client.on('error', (err: any) => console.log(err));

client.open();

function makeControls(amount: number): IControlData[] {
    const controls: IControlData[] = [];
    for (let i = 0; i < amount; i++) {
        const button: IButtonData = {
            controlID: `${i}`,
            kind: 'button',
            text: `Button ${i}`,
        };
        controls.push(button);
    }
    return controls;
}

client.createControls({
    sceneID: 'default',
    controls: makeControls(5),
}).then(controls => {
    controls.forEach(control => {
        control.on('mousedown', (data: IInputEvent) => {
            console.log(`${data.participant.username} pushed me!`);
        });
    });
});

