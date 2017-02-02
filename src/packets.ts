import { EventEmitter } from 'events';

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

export interface IMethod extends IPacket {
    method: string;
    params: { [key: string]: any }
    discard?: boolean
}

export interface IError {
    code: number;
    message: string;
    path: string;
}

export interface IReply extends IPacket {
    result: null | { [key: string]: any }
    error: null | IError
}


/**
 * A Packet is a data type that can be sent over the wire to Constellation.
 */
export class Packet extends EventEmitter {
    private state: PacketState = PacketState.Pending;
    private timeout: number;

    private data: IPacket;

    constructor(data: IPacket) {
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
    toJSON(): { [key: string]: any } {
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

export class Method extends Packet {
    constructor(method: string, params: { [key: string]: any }, discard?:boolean) {
        const methodData: IMethod = {
            type: 'method',
            method,
            params,
            id: Math.floor(Math.random() * maxInt32),
        };
        if (discard) {
            methodData.discard = discard;
        }
        super(methodData);
    }
}

export class Reply extends Packet {
    constructor(id: number, result: { [key: string]: any } = null, error = null) {
        const replyData: IReply = {
            id,
            type: 'reply',
            result,
            error,
        };
        super(replyData);
    }
}