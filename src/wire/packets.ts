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

const maxInt32 = 0xffffffff;

/**
 * A Packet is a wrapped Method that can be timed-out or canceled whilst it travels over the wire.
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

    /**
     * Sets the sequence number on the outgoing packet.
     */
    public setSequenceNumber(x: number): this {
        this.method.seq = x;
        return this;
    }

    public setState(state: PacketState) {
        if (state === this.state) {
            return;
        }

        this.state = state;
    }
}

/**
 * A method represents a request from a client to call a method on the recipient.
 * They can contain arguments which the recipient will use as arguments for the method.
 *
 * The Recipient can then reply with a result or an error indicating the method failed.
 */
export class Method<T> {
    public readonly type = 'method'; //tslint:disable-line
    public seq: number;

    constructor(
        /**
         * The name of this method
         */
        public method: string,
        /**
         * Params to be used as arguments for this method.
         */
        public params: T,
        /**
         * If discard is set to true it indicates that this method is not expecting a reply.
         *
         * Recipients should however reply with an error if one is caused by this method.
         */
        public discard: boolean = false,
        /**
         * A Unique id for each method sent.
         */
        public id: number = Math.floor(Math.random() * maxInt32),
    ) {}

    /**
     * Creates a method instance from a JSON decoded socket message.
     * @memberOf Method
     */
    public static fromSocket(message: any): Method<IRawValues> {
        return new Method(
            message.method,
            message.params,
            message.discard,
            message.id,
        );
    }

    /**
     * Creates a reply for this method.
     */
    public reply(
        result: IRawValues,
        error: InteractiveError.Base = null,
    ): Reply {
        return new Reply(this.id, result, error);
    }
}

/**
 * A reply represents a recipients response to a corresponding method with the same id.
 * It can contain a result or an error indicating that the method failed.
 */
export class Reply {
    public readonly type = 'reply'; //tslint:disable-line
    constructor(
        /**
         * A unique id for this reply, which must match the id of the method it is a reply for.
         */
        public id: number,
        /**
         * The result of this method call.
         */
        public result: IRawValues = null,
        /**
         * An error which if present indicates that a method call failed.
         */
        public error: IInteractiveError = null,
    ) {}

    /**
     * Constructs a reply packet from raw values coming in from a socket.
     */
    public static fromSocket(message: any): Reply {
        const err: InteractiveError.Base = message.error
            ? InteractiveError.fromSocketMessage(message.error)
            : null;
        return new Reply(message.id, message.result, err);
    }

    /**
     * Construct a reply packet that indicates an error.
     */
    public static fromError(id: number, error: InteractiveError.Base): Reply {
        return new Reply(id, null, {
            message: error.message,
            code: error.code,
        });
    }
}
