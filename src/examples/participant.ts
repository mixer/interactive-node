import * as WebSocket from 'ws';

import { Button } from '../state/controls';
import { Scene } from '../state/Scene';

import * as Interactive from '../';

import { request } from './client';

import * as readline from 'readline';

if (process.argv.length < 6) {
    console.log('Usage participant.exe <username> <password> <url> <channelid>');
}

const rl = readline.createInterface(process.stdin, process.stdout);

Interactive.setWebSocket(WebSocket);
const auth = {
    username: process.argv[2],
    password: process.argv[3],
};

request('POST', 'users/login', auth)
.then(() => request('POST', 'jwt/authorize', {}))
.then(res => {
    const client = new Interactive.ParticipantClient({
         jwt: res.headers.get('x-jwt'),
         url: process.argv[4] || 'wss://interactive1-dal.beam.pro/participant',
         channelID: parseInt(process.argv[5], 10) || 36241,
    });
    // client.on('message', (err: any) => console.log('<<<', err));
    // client.on('send', (err: any) => console.log('>>>', err));
    // client.on('error', (err: any) => console.log(err));
    client.open();

    client.state.on('sceneCreated', (scene: Scene ) => {
        const buttons: string[] = [];
        scene.controls.forEach(control => {
            buttons.push(control.controlID);
        });
        rl.setPrompt('Push which button: ' + buttons.sort().join(',') + '\n');
        rl.prompt();

        rl.on('line', line => {
            const cmd = line.trim();
            const control = <Button> scene.getControl(cmd);
            if (!control) {
                console.log('cant find that control');
                rl.prompt();
                return;
            }
            control.giveInput({
                event: 'mousedown',
                button: 0,
            })
            .then(() => {
                rl.prompt();
            })
            .catch(() => {
                console.log('error sending that input');
                rl.prompt();
            });
        });
    });
});

