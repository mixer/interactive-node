/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import {
    GameClient,
    IParticipant,
    ITextbox,
    ITextboxData,
    setWebSocket,
} from '../lib';

if (process.argv.length < 4) {
    console.log('Usage gameClient.exe <token> <versionId>');
    process.exit();
}
// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

const txtChange: ITextboxData = {
    kind: 'textbox',
    controlID: 'txtChange',
    placeholder: 'Text sends on change!',
    position: [
        {
            size: 'large',
            width: 30,
            height: 4,
            x: 2,
            y: 1,
        },
        {
            size: 'medium',
            width: 15,
            height: 4,
            x: 1,
            y: 0,
        },
        {
            size: 'small',
            width: 15,
            height: 4,
            x: 1,
            y: 0,
        },
    ],
};

const txtSubmit: ITextboxData = {
    kind: 'textbox',
    controlID: 'txtSubmit',
    placeholder: 'Text sends on submit!',
    hasSubmit: true,
    position: [
        {
            size: 'large',
            width: 30,
            height: 4,
            x: 2,
            y: 5,
        },
        {
            size: 'medium',
            width: 15,
            height: 4,
            x: 0,
            y: 4,
        },
        {
            size: 'small',
            width: 15,
            height: 4,
            x: 0,
            y: 4,
        },
    ],
};

const txtCost: ITextboxData = {
    kind: 'textbox',
    controlID: 'txtCost',
    placeholder: 'Forced Submit because cost!',
    cost: 200,
    position: [
        {
            size: 'large',
            width: 30,
            height: 4,
            x: 2,
            y: 9,
        },
        {
            size: 'medium',
            width: 15,
            height: 4,
            x: 0,
            y: 8,
        },
        {
            size: 'small',
            width: 15,
            height: 4,
            x: 0,
            y: 8,
        },
    ],
};

// Log when we're connected to interactive and setup your game!
client.on('open', () => {
    console.log('Connected to Interactive!');
    // Now we can create the controls, We need to add them to a scene though.
    // Every Interactive Experience has a "default" scene so we'll add them there there.
    client
        .createControls({
            sceneID: 'default',
            controls: [txtChange, txtSubmit, txtCost],
        })
        .then(controls => {
            // Now that the controls are created we can add some event listeners to them!
            controls.forEach((control: ITextbox) => {
                // move here means that someone has clicked the button.
                control.on('change', (inputEvent, participant) => {
                    // Let's tell the user who they are, and what text they sent.
                    console.log(
                        `${participant.username} changed ${
                            inputEvent.input.controlID
                        } with the value: ${inputEvent.input.value}`,
                    );

                    // Did this push involve a spark cost?
                    if (inputEvent.transactionID) {

                        // Unless you capture the transaction the sparks are not deducted.
                        client.captureTransaction(inputEvent.transactionID)
                        .then(() => {
                            console.log(`Charged ${participant.username} ${control.cost} sparks!`);
                        });
                    }
                });

                control.on('submit', (inputEvent, participant) => {
                    // Let's tell the user who they are, and what text they sent.
                    console.log(
                        `${participant.username} submit ${
                            inputEvent.input.controlID
                        } with the value: ${inputEvent.input.value}`,
                    );

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
            client.ready(true);
        });
});

// These can be un-commented to see the raw JSON messages under the hood
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
});

client.state.on('participantJoin', participant => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on(
    'participantLeave',
    (participantSessionID: string, participant: IParticipant) => {
        console.log(`${participant.username}(${participantSessionID}) Left`);
    },
);
/* tslint:enable:no-console */
