import { Client, ClientType } from './Client';

export interface IGameClientOptions {
    experienceId: number;
    authToken: string;
    url: string;
}

export class GameClient extends Client {
    constructor(options: IGameClientOptions) {
        super({
            clientType: ClientType.GameClient,
            socketOptions: {
                authToken: options.authToken,
                url: `${options.url}/gameClient`,
                extraHeaders: {
                    'X-Interactive-Version': options.experienceId,
                },
            },
        });
    }
}
