import { Client } from '../client';

export class Frontend extends Client {
    public static set WebSocket(ws: any) {
        Client.WebSocket = ws;
    }
}
