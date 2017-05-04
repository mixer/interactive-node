/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import {
    GameClient,
    IButton,
    IButtonData,
    IControlData,
    setWebSocket,
} from '../src';

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

// These can be un-commented to see the raw JSON messages under the hood
client.on('message', (err: any) => console.log('<<<', err));
client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    url: process.argv[3],
    versionId: parseInt(process.argv[4], 10),
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
            text: `Button ${i}`,
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

// Now we can create the controls, We need to add them to a scene though.
// Every Interactive Experience has a "default" scene so we'll add them there there.
client.createControls({
    sceneID: 'default',
    controls: makeControls(5),
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
            //Five second cooldown
            control.setCooldown(5000);
        });
    });
    // Controls don't appear unless we tell Interactive that we are ready!
    client.ready(true);
});

client.state.on('participantJoin', participant => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participant: string ) => {
    console.log(`${participant} Left`);
});
/* tslint:enable:no-console */
