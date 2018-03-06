/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import * as faker from 'faker';

import {
    GameClient,
    IControlData,
    IParticipant,
    setWebSocket,
} from '../lib';

import { makeControls, updateControls } from './util';

if (process.argv.length < 4) {
    console.log('Usage gameClient.exe <token> <versionId>');
    process.exit();
}
// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

// These can be un-commented to see the raw JSON messages under the hood
// client.on('message', (err: any) => console.log('<<<', err));
// client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

const delayTime = 1000;
let controls: IControlData[] = [];

/* Loop creates 5 controls and adds them to the default scene.
 * It then waits delayTime milliseconds and then deletes them,
 * before calling itself again.
*/
function loop() {
    const scene = client.state.getScene('default');
    scene.updateControls(updateControls(controls, () => faker.name.firstName()));
}

let loopInterval: any;

// Log when we're connected to interactive and setup your game!
client.on('open', () => {
    console.log('Connected to Interactive!');
    /* Pull in the state stored on the server
    * then call ready so our controls show up.
    * then call loop() to begin our loop.
    */
    clearInterval(loopInterval);
    client.synchronizeState()
    .then(() => {
        const scene = client.state.getScene('default');
        scene.deleteAllControls();
        controls = makeControls(8, () => faker.name.firstName());
        scene.createControls(controls);
    })
    .then(() => client.ready(true))
    .then(() => {
        loopInterval = setInterval(loop, delayTime);
    });
});

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
});

client.state.on('participantJoin', (participant: IParticipant ) => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participantSessionID: string, participant: IParticipant ) => {
    console.log(`${participant.username}(${participantSessionID}) Left`);
});
/* tslint:enable:no-console */
