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
    // Now we can create the controls, We need to add them to a scene though.
    // Every Interactive Experience has a "default" scene so we'll add them there there.
    return client.createControls({
        sceneID: 'default',
        controls: makeControls(5, i => `Button ${i}`),
    });
}).then(controls => {

    // Now that the controls are created we can add some event listeners to them!
    controls.forEach((control: IButton) => {

        // mousedown here means that someone has clicked the button.
        control.on('mousedown', (inputEvent, participant) => {

            // Let's tell the user who they are, and what they pushed.
            console.log(`${participant.username} pushed, ${inputEvent.input.controlID}`);

            // Did this push involve a spark cost?
            if (inputEvent.transactionID) {

                // Unless you capture the transaction the sparks are not deducted.
                client.captureTransaction(inputEvent.transactionID)
                .then(() => {
                    console.log(`Charged ${participant.username} ${control.cost} sparks!`);
                });
            }
        });
    });
    // Controls don't appear unless we tell Interactive that we are ready!
    return client.ready(true);
});

client.state.on('participantJoin', participant => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participantSessionID: string, participant: IParticipant ) => {
    console.log(`${participant.username}(${participantSessionID}) Left`);
});
/* tslint:enable:no-console */
