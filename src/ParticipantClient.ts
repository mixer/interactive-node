import { Client, ClientType } from './Client';
import { IJSON } from './interfaces';
import { IInput } from './state/interfaces/controls';

export interface IParticipantOptions {
    /**
     * A JWT representing a Beam.pro session
     */
    jwt: string;
    /**
     * A url for the Interactive session you'd like to join.
     * @example wss://interactive1-dal.beam.pro/participant?channel=<channelid>
     */
    url: string;
    /**
     * Any extra query parameters you'd like to include on the connection, usually used for debugging.
     */
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
    /**
     * Sends an input event to the Interactive Server, Called by Controls.
     */
    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
