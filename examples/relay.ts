import { IControlData } from './../lib/state/interfaces/controls/IControl.d';
/* tslint:disable:no-console */
import * as WebSocket from 'ws';

import { GameClient, IControl, IInputEvent, IParticipant, setWebSocket } from '../lib';

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
                control.once(
                    'create',
                    (
                        event: IInputEvent<IControl & { controls: string[] }>,
                        _participant: IParticipant,
                    ) => {
                        console.log(event);
                        broadcast('test', 1);
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
        })
        .then(() => client.synchronizeState())
        .then(() =>
            client.state.getScene('default').getControls().forEach((control: IControl) => {
                console.log(control);
                control.on(
                    'generic',
                    (
                        event: IInputEvent<IControl & { name: string; data: any }>,
                        participant: IParticipant,
                    ) => {
                        broadcast(event.input.name, { participant });
                    },
                );
            }),
        );
});

// These can be un-commented to see the raw JSON messages under the hood
// client.on('message', (err: any) => console.log('<<<', err));
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

function broadcast(name: string, value?: any) {
    client.broadcastEvent({
        scope: ['everyone'],
        data: {
            name,
            value,
        },
    });
}
/* tslint:enable:no-console */
