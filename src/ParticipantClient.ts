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
     * This should be retrieved from https://beam.pro/api/v1/interactive/{channelId}
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
    /**
     * Sends an input event to the Interactive Server. This should only be called
     * by controls.
     */
    public giveInput<T extends IInput>(input: T): Promise<void> {
        return this.execute('giveInput', input, false);
    }
}
