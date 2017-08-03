import { Client, ClientType } from './Client';
import { IJSON } from './interfaces';
import { IInput } from './state/interfaces/controls';

export interface IParticipantOptions {
    /**
     * An access key for the Mixer.com session
     */
    key: string;
    /**
     * A url for the Interactive session you'd like to join.
     * This should be retrieved from https://mixer.com/api/v1/interactive/{channelId}
     * @example wss://interactive1-dal.mixer.com/participant?channel=<channelid>
     */
    url: string;
    /**
     * Any extra query parameters you'd like to include on the connection, usually used for debugging.
     */
    extraParams?: IJSON;

    /**
     * Optional intercept function that can be run before socket reconnections.
     */
    reconnectChecker?: () => Promise<void>;
}

export class ParticipantClient extends Client {
    constructor() {
        super(ClientType.Participant);
    }

    public open(options: IParticipantOptions): Promise<this> {
        return super.open({
            url: options.url,
            reconnectChecker: options.reconnectChecker,
            queryParams: {
                'x-protocol-version': '2.0',
                key: options.key,
                ...options.extraParams,
            },
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
