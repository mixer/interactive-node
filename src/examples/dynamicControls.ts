/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import * as faker from 'faker';

import { IParticipant } from '../state/interfaces';
import { delay } from '../util';

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
// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

// Log when we're connected to interactive
client.on('open', () => console.log('Connected to interactive'));

// These can be uncommented to see the raw JSON messages under the hood
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

// Now we open the conection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    url: process.argv[3] || 'wss://interactive1-dal.beam.pro',
    experienceId: parseInt(process.argv[4], 10) || 3419,
});

/**
 * This makes button objects, it will make the amount of buttons we tell it to
 * we'll use it to create controls dynamically!
 */
function makeControls(amount: number): IControlData[] {
    const controls: IButtonData[] = [];
    const size = 10;
    for (let i = 0; i < amount; i++) {
        controls.push({
            controlID: `${i}`,
            kind: 'button',
            text: faker.name.firstName(),
            cost: 1,
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

function loop() {
    const scene = client.state.getScene('default');
    scene.createControls(makeControls(5)).then(() => delay(2000))
        .then(() => scene.deleteControls(['0', '1', '2', '3', '4']))
        .then(() => delay(2000))
        .then(() => loop());
}

client.initialize()
    .then(() => client.ready(true))
    .then(() => loop());

client.state.on('participantJoin', (participant: IParticipant ) => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participant: string ) => {
    console.log(`${participant} Left`);
});
/* tslint:enable:no-console */
