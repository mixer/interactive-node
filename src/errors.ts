import { IncomingMessage } from 'http';
export class BaseError extends Error {
    constructor(public readonly message: string) {
        super();
        if (Error.captureStackTrace) {
            // chrome etc.
            Error.captureStackTrace(this, this.constructor);
            return;
        }
        const stack = new Error().stack.split('\n'); // removes useless stack frame
        stack.splice(1, 1);
        this.stack = stack.join('\n');
    }

    protected static setProto(error: BaseError) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(error, this.prototype);
            return;
        }
        (<any>error).__proto__ = this.prototype; // Super emergency fallback
    }
}

/**
 * Cancelled errors are thrown when the packet is cancelled by the client before
 * a reply was received.
 */
export class CancelledError extends BaseError {
    constructor() {
        super(
            'Packet was cancelled or socket was closed before a reply was received.',
        );
        CancelledError.setProto(this);
    }
}

/**
 * HTTPError is used when a request does not respond successfully.
 */
export class HTTPError extends BaseError {
    constructor(
        public code: number,
        message: string,
        private res: IncomingMessage,
    ) {
        super(message);
        HTTPError.setProto(this);
    }

    public cause(): IncomingMessage {
        return this.res;
    }
}

/**
 * This error is thrown when you try to perform an action which is not supported by an
 * instantiated [Client]{@link Client}.
 */
export class PermissionDeniedError extends BaseError {
    constructor(operation: string, source: string) {
        super(`You don't have permission to ${operation} from ${source}!`);
        PermissionDeniedError.setProto(this);
    }
}

/**
 * TimeoutErrors occur when a reply is not received from the server after a defined
 * wait period.
 */
export class TimeoutError extends BaseError {
    constructor(message: string) {
        super(message);
        TimeoutError.setProto(this);
    }
}

/**
 * MessageParseError indicates that a message received is invalid JSON.
 */
export class MessageParseError extends BaseError {
    constructor(message: string) {
        super(message);
        MessageParseError.setProto(this);
    }
}

/**
 * NoInteractiveServersAvailable indicates that a request to retrieve
 * available interactive servers failed and that none can be located.
 */
export class NoInteractiveServersAvailable extends BaseError {
    constructor(message: string) {
        super(message);
        NoInteractiveServersAvailable.setProto(this);
    }
}

/**
 * An interactive error, sent in a reply to a method that failed.
 */
export interface IInteractiveError {
    /**
     * A unique numerical code for this error.
     *
     * @example `4019`
     */
    code: number;
    /**
     * A human readable message detailing the cause of this error.
     */
    message: string;
    /**
     * An optional path that points at the element within an interactive session that
     * caused this error to occur.
     */
    path?: string;
}

export namespace InteractiveError {
    export class Base extends BaseError {
        public path: string | null;
        constructor(message: string, public code: number) {
            super(message);
            Base.setProto(this);
        }
    }

    export const errors: { [code: number]: typeof Base } = {};

    export const startOfRange = 4000;

    export function fromSocketMessage(error: IInteractiveError): Base {
        if (errors[error.code]) {
            const err = new errors[error.code](error.message, error.code);
            err.path = error.path;
            return err;
        }

        return new Base(error.message, error.code);
    }

    export class CloseUnknown extends Base {
        constructor(message: string) {
            super(message, 1011);
            CloseUnknown.setProto(this);
        }
    }
    errors[1011] = CloseUnknown;

    export class CloseRestarting extends Base {
        constructor(message: string) {
            super(message, 1012);
            CloseRestarting.setProto(this);
        }
    }
    errors[1012] = CloseRestarting;

    /**
     * Indicates that a message received at the server is invalid JSON.
     */
    export class InvalidPayload extends Base {
        constructor(message: string) {
            super(message, 4000);
            InvalidPayload.setProto(this);
        }
    }
    errors[4000] = InvalidPayload;

    /**
     * Indicates that the server was unable to decompress a frame
     * sent from the client.
     */
    export class PayloadDecompression extends Base {
        constructor(message: string) {
            super(message, 4001);
            PayloadDecompression.setProto(this);
        }
    }
    errors[4001] = PayloadDecompression;

    /**
     * Indicates that the server did not recognize the type of packet sent to it.
     */
    export class UnknownPacketType extends Base {
        constructor(message: string) {
            super(message, 4002);
            UnknownPacketType.setProto(this);
        }
    }
    errors[4002] = UnknownPacketType;

    /**
     * Indicates that the server did not recognize the method name sent to it.
     */
    export class UnknownMethodName extends Base {
        constructor(message: string) {
            super(message, 4003);
            UnknownMethodName.setProto(this);
        }
    }
    errors[4003] = UnknownMethodName;

    /**
     * Indicates that the server was unable to parse the method's arguments.
     */
    export class InvalidMethodArguments extends Base {
        constructor(message: string) {
            super(message, 4004);
            InvalidMethodArguments.setProto(this);
        }
    }
    errors[4004] = InvalidMethodArguments;

    /**
     * Indicates that an invalid Etag was sent to the server when the client wished to update some state.
     */
    export class EtagMismatch extends Base {
        constructor(message: string) {
            super(message, 4005);
            EtagMismatch.setProto(this);
        }
    }
    errors[4005] = EtagMismatch;

    /**
     * Indicates that an invalid transactionId was specified in a `capture` method.
     */
    export class InvalidTransactionId extends Base {
        constructor(message: string) {
            super(message, 4006);
            InvalidTransactionId.setProto(this);
        }
    }

    errors[4006] = InvalidTransactionId;

    /**
     * Indicates that a transaction failed to capture because the participant does not have enough sparks.
     */
    export class NotEnoughSparks extends Base {
        constructor(message: string) {
            super(message, 4007);
            NotEnoughSparks.setProto(this);
        }
    }

    errors[4007] = NotEnoughSparks;

    /**
     * Indicates that an operation was attempted on a Group that the server does not know about.
     */
    export class UnknownGroup extends Base {
        constructor(message: string) {
            super(message, 4008);
            UnknownGroup.setProto(this);
        }
    }

    errors[4008] = UnknownGroup;

    /**
     * Indicates that the group you're trying to create already exists.
     */
    export class GroupAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4009);
            GroupAlreadyExists.setProto(this);
        }
    }

    errors[4009] = GroupAlreadyExists;

    /**
     * Indicates that a scene that you're trying to operate on is not known by the server.
     */
    export class UnknownSceneId extends Base {
        constructor(message: string) {
            super(message, 4010);
            UnknownSceneId.setProto(this);
        }
    }

    errors[4010] = UnknownSceneId;

    /**
     * Indicates that the scene you're trying to create already exists.
     */
    export class SceneAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4011);
            SceneAlreadyExists.setProto(this);
        }
    }

    errors[4011] = SceneAlreadyExists;

    /**
     * Indicates that you're trying to perform an operation on a control
     * that is not known by the server.
     */
    export class UnknownControlId extends Base {
        constructor(message: string) {
            super(message, 4012);
            UnknownControlId.setProto(this);
        }
    }

    errors[4012] = UnknownControlId;

    /**
     * Indicates that the control you're trying to create already exists.
     */
    export class ControlAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4013);
            ControlAlreadyExists.setProto(this);
        }
    }

    errors[4013] = ControlAlreadyExists;

    /**
     * Indicates that you're trying to create a control whose type is not
     * recognized by the server.
     */
    export class UnknownControlType extends Base {
        constructor(message: string) {
            super(message, 4014);
            UnknownControlType.setProto(this);
        }
    }

    errors[4014] = UnknownControlType;

    /**
     * Indicates that you're trying to perform an operation on a Participant
     * that the server is not aware of.
     */
    export class UnknownParticipant extends Base {
        constructor(message: string) {
            super(message, 4015);
            UnknownParticipant.setProto(this);
        }
    }
    errors[4015] = UnknownParticipant;

    /**
     * Sent in a Close frame when the interactive session is ending.
     */
    export class SessionClosing extends Base {
        constructor(message: string) {
            super(message, 4016);
            SessionClosing.setProto(this);
        }
    }
    errors[4016] = SessionClosing;

    /**
     * Sent in a close frame when the GameClient exceeds memory usage limits on the server.
     */
    export class OutOfMemory extends Base {
        constructor(message: string) {
            super(message, 4017);
            OutOfMemory.setProto(this);
        }
    }
    errors[4017] = OutOfMemory;

    /**
     * Thrown when an attempt is made to delete a default resource such as a Scene or Group.
     */
    export class CannotDeleteDefault extends Base {
        constructor(message: string) {
            super(message, 4018);
            CannotDeleteDefault.setProto(this);
        }
    }
    errors[4018] = CannotDeleteDefault;

    /**
     * CannotAuthenticate occurs when the server fails to authenticate the client.
     * This is usually caused by the provided Authentication details be invalid or missing.
     */
    export class CannotAuthenticate extends Base {
        constructor(message: string) {
            super(message, 4019);
            CannotAuthenticate.setProto(this);
        }
    }
    errors[4019] = CannotAuthenticate;

    /**
     * NoInteractiveVersion occurs when the server is unable to validate your Interactive
     * Project Version ID. This can occur if your project version id is invalid or missing,
     * or if you do not have access to this version.
     */
    export class NoInteractiveVersion extends Base {
        constructor(message: string) {
            super(message, 4020);
            NoInteractiveVersion.setProto(this);
        }
    }
    errors[4020] = NoInteractiveVersion;

    /**
     * SessionConflict occurs when the server detects a conflicting connection from the client.
     * This can occur if the requested channel is already interactive or as a participant if
     * you're already connected to a channel.
     */
    export class SessionConflict extends Base {
        constructor(message: string) {
            super(message, 4021);
            SessionConflict.setProto(this);
        }
    }
    errors[4021] = SessionConflict;

    /**
     * ChannelNotInteractive occurs when you try to connect to a channel that is not interactive.
     */
    export class ChannelNotInteractive extends Base {
        constructor(message: string) {
            super(message, 4022);
            ChannelNotInteractive.setProto(this);
        }
    }
    errors[4022] = ChannelNotInteractive;

    /**
     * Indicates input sent from a participant is invalid.
     */
    export class BadUserInput extends Base {
        constructor(message: string) {
            super(message, 4999);
            BadUserInput.setProto(this);
        }
    }

    errors[4999] = BadUserInput;
}
