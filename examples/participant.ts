import * as WebSocket from 'ws';

import { Button } from '../src/state/controls';
import { Scene } from '../src/state/Scene';

import * as Interactive from '../src';

import { request } from './client';

import * as readline from 'readline';

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
         url: 'wss://interactive1-dal.beam.pro/participant',
         channelID: 36241,
    });
    client.on('message', (err: any) => console.log('<<<', err));
    client.on('send', (err: any) => console.log('>>>', err));
    client.on('error', (err: any) => console.log(err));
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
            console.log(cmd);
            const control = <Button> scene.getControl(cmd);
            if (!control) {
                console.log('cant find that control');
                return;
            }
            control.giveInput({
                event: 'mousedown',
                button: 0,
            });
        });
    });
});

