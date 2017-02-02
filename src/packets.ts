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

export interface IPacket {
    id: number;
    type: 'method' | 'reply';
}

export interface IRawValues {
    [key: string]: any;
}

export interface IMethod extends IPacket {
    readonly method: string;
    readonly params: IRawValues;
    readonly discard?: boolean;
}

export interface IReply extends IPacket {
    readonly result: null | IRawValues;
    readonly error: null | InteractiveError.Base;
}


/**
 * A Packet is a wrapped Method or Reply that can be sent over the wire
 */
export class Packet extends EventEmitter {
    private state: PacketState = PacketState.Pending;
    private timeout: number;

    private data: Method;

    constructor(data: Method) {
        super();
        this.data = data;
    }

    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    id(): number {
        return this.data.id;
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
        return this.data;
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

export class Method implements IMethod {
    public id;
    public type: 'method';
    constructor(
        public method: string,
        public params: IRawValues,
        public discard?:boolean
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

export class Reply implements IReply {
    public type: 'reply';
    constructor(
        public id: number,
        public result: IRawValues = null,
        public error = null
    ) {}

    public static fromSocket(message: any): Reply {
        let err = message.error ? InteractiveError.from(message.error) : null;
        const reply = new Reply(message.id, message.result, message.error);
        // TODO do we need a new state here?
        return reply;
    }

    public static fromError(id: number, error: InteractiveError.Base) {
        return new Reply(id, null, error);
    }
}
