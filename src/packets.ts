import { EventEmitter } from 'events';
import { InteractiveError } from './errors';


export enum PacketState {
    // The packet has not been sent yet, it may be queued for later sending
    Pending = 1,
    // The packet has been sent over the websocket successfully and we are
    // waiting for a reply.
    Sending,
    // The packet was replied to, and has now been complete.
    Replied,
    // The caller has indicated they no longer wish to be notified about this event.
    Cancelled
}

const maxInt32 = 0xFFFFFFFF;

export type PacketType = 'method' | 'reply';

export interface IRawValues {
    [key: string]: any;
}


/**
 * A Packet is a wrapped Method that can be sent over the wire, it is wrapped for timing and
 * cancellation.
 */
export class Packet extends EventEmitter {
    private state: PacketState = PacketState.Pending;
    private timeout: number;

    private method: Method;

    constructor(method: Method) {
        super();
        this.method = method;
    }

    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    id(): number {
        return this.method.id;
    }

    /**
     * Aborts sending the message, if it has not been sent yet.
     */
    cancel() {
        this.emit('cancel');
        this.setState(PacketState.Cancelled);
    }

    /**
     * toJSON implements is called in JSON.stringify.
     */
    toJSON(): IRawValues {
        return this.method;
    }

    /**
     * Sets the timeout duration on the packet. It defaults to the socket's
     * timeout duration.
     */
    setTimeout(duration: number) {
        this.timeout = duration;
    }

    /**
     * Returns the packet's timeout duration, or the default if undefined.
     */
    getTimeout(defaultTimeout: number): number {
        return this.timeout || defaultTimeout;
    }

    /**
     * Returns the current state of the packet.
     * @return {PacketState}
     */
    getState(): PacketState {
        return this.state;
    }

    setState(state: PacketState) {
        if (state === this.state) {
            return;
        }

        this.state = state;
    }
}

export class Method {
    public id;
    public type = 'method';

    constructor(
        public method: string,
        public params: IRawValues,
        public discard: boolean = false,
    ) {
        this.id = Math.floor(Math.random() * maxInt32);
    }

    public static fromSocket(message: any) {
        const method = new Method(message.method, message.params, message.discard);
        return method;
    }

    public reply(result: IRawValues, error = null ): Reply {
        return new Reply(this.id(), result, error);
    }
}

export class Reply {
    public type = 'reply';
    constructor(
        public id: number,
        public result: IRawValues = null,
        public error = null
    ) {}

    /**
     * Constructs a Reply packet from raw values coming in from a socket
     */
    public static fromSocket(message: any): Reply {
        let err = message.error ? InteractiveError.from(message.error) : null;
        const reply = new Reply(message.id, message.result, err);
        return reply;
    }

    /**
     * Construct a reply packet that indicates an error
     */
    public static fromError(id: number, error: InteractiveError.Base) {
        return new Reply(id, null, error);
    }
}
