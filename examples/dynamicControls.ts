/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import * as faker from 'faker';

import {
    delay,
    GameClient,
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
// client.on('message', (err: any) => console.log('<<<', err));
// client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

const delayTime = 2000;

/* Loop creates 5 controls and adds them to the default scene.
 * It then waits delayTime milliseconds and then deletes them,
 * before calling itself again.
*/
function loop() {
    const scene = client.state.getScene('default');
    scene.createControls(makeControls(5, () => faker.name.firstName()))
        .then(() => delay(delayTime))
        .then(() => scene.deleteAllControls())
        .then(() => delay(delayTime))
        .then(() => loop());
}

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
})
.then(() => {
    /* Pull in the state stored on the server
    * then call ready so our controls show up.
    * then call loop() to begin our loop.
    */
    return client.synchronizeState();
})
.then(() => client.ready(true))
.then(() => loop());

client.state.on('participantJoin', (participant: IParticipant ) => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participantSessionID: string, participant: IParticipant ) => {
    console.log(`${participant.username}(${participantSessionID}) Left`);
});
/* tslint:enable:no-console */
