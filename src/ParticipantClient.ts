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

    public open(options: IParticipantOptions): this {
        super.open({
            jwt: options.jwt,
            url: options.url,
            queryParams: Object.assign(
                {
                    'x-protocol-version': '2.0',
                },
                options.extraParams,
            ),
        });
        return this;
    }

    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
