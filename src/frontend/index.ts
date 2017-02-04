import { Client } from '../client';

export class Frontend extends Client {
    public static set WebSocket(ws: WebSocket) {
        Client.WebSocket = ws;
    }
}
