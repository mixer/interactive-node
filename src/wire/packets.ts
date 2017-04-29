import { EventEmitter } from 'events';
import { IInteractiveError, InteractiveError } from '../errors';
import { IRawValues } from '../interfaces';

export enum PacketState {
    /**
     *  The packet has not been sent yet, it may be queued for later sending.
     */
    Pending = 1,
    /**
     * The packet has been sent over the websocket successfully and we are
     * waiting for a reply.
     */
    Sending,
    /**
     * The packet was replied to, and has now been complete.
     */
    Replied,
    /**
     *  The caller has indicated they no longer wish to be notified about this event.
     */
    Cancelled,
}

const maxInt32 = 0xFFFFFFFF;

/**
 * A Packet is a wrapped Method that can be timed-out or canceled whilst it travels over the wire
 */
export class Packet extends EventEmitter {
    private state: PacketState = PacketState.Pending;
    private timeout: number;

    private method: Method<any>;

    constructor(method: Method<any>) {
        super();
        this.method = method;
    }

    /**
     * Returns the randomly-assigned numeric ID of the packet.
     * @return {number}
     */
    public id(): number {
        return this.method.id;
    }

    /**
     * Aborts sending the message, if it has not been sent yet.
     */
    public cancel() {
        this.emit('cancel');
        this.setState(PacketState.Cancelled);
    }

    /**
     * toJSON implements is called in JSON.stringify.
     */
    public toJSON(): IRawValues {
        return this.method;
    }

    /**
     * Sets the timeout duration on the packet. It defaults to the socket's
     * timeout duration.
     */
    public setTimeout(duration: number) {
        this.timeout = duration;
    }

    /**
     * Returns the packet's timeout duration, or the default if undefined.
     */
    public getTimeout(defaultTimeout: number): number {
        return this.timeout || defaultTimeout;
    }

    /**
     * Returns the current state of the packet.
     * @return {PacketState}
     */
    public getState(): PacketState {
        return this.state;
    }

    public setState(state: PacketState) {
        if (state === this.state) {
            return;
        }

        this.state = state;
    }
}

export class Method<T> {
    public type = 'method'; //tslint:disable-line

    constructor(
        public method: string,
        public params: T,
        public discard: boolean = false,
        public id: number = Math.floor(Math.random() * maxInt32),
    ) {}

    public static fromSocket(message: any): Method<IRawValues> {
        return  new Method(message.method, message.params, message.discard, message.id);
    }

    public reply(result: IRawValues, error: InteractiveError.Base = null): Reply {
        return new Reply(this.id, result, error);
    }
}

export class Reply {
    public type = 'reply'; //tslint:disable-line
    constructor(
        public id: number,
        public result: IRawValues = null,
        public error: IInteractiveError = null,
    ) {}

    /**
     * Constructs a Reply packet from raw values coming in from a socket
     */
    public static fromSocket(message: any): Reply {
        const err: InteractiveError.Base = message.error ? InteractiveError.fromSocketMessage(message.error) : null;
        return new Reply(message.id, message.result, err);
    }

    /**
     * Construct a reply packet that indicates an error
     */
    public static fromError(id: number, error: InteractiveError.Base): Reply {
        return new Reply(id, null, {
            message: error.message,
            code: error.code,
        });
    }
}
