import { Client, ClientType } from './Client';
import { IJSON } from './interfaces';
import { IInput } from './state/interfaces/controls';

export interface IParticipantOptions {
    jwt: string;
    url: string;
    extraParams?: IJSON;
}

export class ParticipantClient extends Client {
    constructor() {
        super(ClientType.Participant);
    }

    public open(options: IParticipantOptions): Promise<this> {
        return super.open({
            jwt: options.jwt,
            url: options.url,
            queryParams: Object.assign(
                {
                    'x-protocol-version': '2.0',
                },
                options.extraParams,
            ),
        });
    }

    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
