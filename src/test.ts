import { Frontend } from './index';
import * as ws from 'ws';

Frontend.WebSocket = ws;
console.log('bloooop');

const interactive =  new Frontend();

interactive.setOptions({
    url: 'ws://127.0.0.1:3000/participant?channel=0'
});

interactive.open();