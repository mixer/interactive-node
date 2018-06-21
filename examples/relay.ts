/**
 * This examples is for custom bundles. In this script, this assumes
 * that your bundle will giveInput on a control with the controlID "setup",
 * with the event being "create", that passes a property controls that is
 * and array of strings.
 *
 * These controls will have a kind of generic, as we don't actually care
 * what they are, as the event will be broadcasted back to everyone, where
 * the bundle will handle these events.
 *
 * Example:
 *     mixer.socket.call('giveInput', {
 *      controlID: 'setup',
 *      event: 'create',
 *      controls: ['btn-one', 'hello-world'],
 *    });
 *
 */

/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import {
    GameClient,
    IControl,
    IControlData,
    IInputEvent,
    IParticipant,
    setWebSocket,
} from '../lib';

// import { makeControls } from './util';

if (process.argv.length < 4) {
    console.log('Usage gameClient.exe <token> <versionId>');
    process.exit();
}
// We need to tell the interactive client what type of websocket we are using.
setWebSocket(WebSocket);

// As we're on the Streamer's side we need a "GameClient" instance
const client = new GameClient();

// Log when we're connected to interactive and setup your game!
client.on('open', () => {
    console.log('Connected to Interactive!');
    client
        .createControls({
            sceneID: 'default',
            controls: [
                {
                    controlID: 'setup',
                    kind: 'generic',
                },
            ],
        })
        .then(() => client.synchronizeState())
        .then(() => client.ready(true))
        .then(() => client.state.getControl('setup'))
        .then((control: IControl) => {
            return new Promise((resolve, reject) => {
                // The Setup controls listens for the create event onces
                // to go off and create the controls that will be used during
                // communication from the participant to this game client.
                control.once(
                    'create',
                    (
                        event: IInputEvent<IControl & { controls: string[] }>,
                        _participant: IParticipant,
                    ) => {
                        const controls: IControlData[] = [];
                        if (event.input.controls) {
                            event.input.controls.forEach(id => {
                                controls.push({
                                    controlID: id,
                                    kind: 'generic',
                                });
                            });
                        }
                        client
                            .createControls({
                                sceneID: 'default',
                                controls,
                            })
                            .then(() => resolve())
                            .catch((_err: Error) => reject());
                    },
                );
            });
        });
});

// These can be un-commented to see the raw JSON messages under the hood
// client.on('send', (err: any) => console.log('>>>', err));
// client.on('error', (err: any) => console.log(err));

// Now we open the connection passing in our authentication details and an experienceId.
client.open({
    authToken: process.argv[2],
    versionId: parseInt(process.argv[3], 10),
});

client.state.on('participantJoin', (participant: IParticipant) => {
    console.log(`${participant.username}(${participant.sessionID}) Joined`);
});
client.state.on('participantLeave', (participantSessionID: string, participant: IParticipant) => {
    console.log(`${participant.username}(${participantSessionID}) Left`);
});

client.on('message', (str: string) => {
    const blob = JSON.parse(str);
    if (
        blob.type === 'method' &&
        blob.method === 'giveInput' &&
        blob.params.input.controlID !== 'setup'
    ) {
        broadcast(blob);
    }
});

function broadcast(params: any) {
    client.broadcastEvent({
        scope: ['everyone'],
        data: params,
    });
}
/* tslint:enable:no-console */
