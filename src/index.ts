import { InteractiveSocket } from './wire/Socket';
export * from './state/interfaces';
export * from './state/Scene';
export * from './state/Group';
export * from './IClient';
export * from './GameClient';
export * from './ParticipantClient';
export * from './constants';
export * from './errors';
export * from './util';

/**
 * This allows you to specify which WebSocket implementation your
 * environment is using. You do not need to do this in Browser environments.
 *
 * @example `Interactive.setWebsocket(require('ws'));`
 */
export function setWebSocket(ws: any) {
    InteractiveSocket.WebSocket = ws;
}
