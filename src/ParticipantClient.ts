import { IInput } from './state/interfaces/controls';
import { Client, ClientType } from './Client';

export interface IParticipantOptions {
    jwt: string;
    url: string;
    channelID: number;
}

export class ParticipantClient extends Client {
    constructor(options: IParticipantOptions) {
        super({
            clientType: ClientType.Participant,
            socketOptions: {
                jwt: options.jwt,
                url: options.url,
                queryParams: {
                    channel: options.channelID,
                },
            },
        });
    }
    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
