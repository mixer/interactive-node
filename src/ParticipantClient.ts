import { Client, ClientType } from './Client';

export interface IParticipantOptions {
    jwt: string;
    url: string;
}

export class ParticipantClient extends Client {
    constructor(options: IParticipantOptions) {
        super({
            clientType: ClientType.Participant,
            socketOptions: {
                jwt: options.jwt,
                url: options.url,
            },
        });
    }
}
