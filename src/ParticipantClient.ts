import { Client, ClientType } from './Client';
import { IInput } from './state/interfaces/controls';

export interface IParticipantOptions {
    jwt: string;
    url: string;
    channelID: number;
}

export class ParticipantClient extends Client {
    constructor() {
        super(ClientType.Participant);
    }

    public open(options: IParticipantOptions): this {
        super.open({
            jwt: options.jwt,
            url: options.url,
            queryParams: {
                channel: options.channelID,
            },
        });
        return this;
    }

    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
