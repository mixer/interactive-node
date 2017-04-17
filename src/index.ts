import { InteractiveSocket } from './wire/Socket';
export * from './state/interfaces';
export * from './IClient';
export * from './GameClient';
export * from './ParticipantClient';
export * from './util';

/**
 * You will likely not need to set this in a browser environment.
 * You will not need to set this if WebSocket is globally available.
 * Set the websocket implementation.
 *
 * @example
 * Interactive.setWebsocket = require('ws');
 */
export function setWebSocket(ws: any) {
    InteractiveSocket.WebSocket = ws;
}
