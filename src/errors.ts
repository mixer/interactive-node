export class BaseError extends Error {
    constructor(public readonly message: string) {
        super();
        if (Error.captureStackTrace) { // chrome etc.
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

export class CancelledError extends BaseError {
    constructor() {
        super('Packet was cancelled or socket was closed before a reply was received.');
        CancelledError.setProto(this);
    }
}

export class PermissionDeniedError extends BaseError {
    constructor(operation: string, source: string) {
        super(`You don't have permission to ${operation} from ${source}!`);
        PermissionDeniedError.setProto(this);
    }
}

export class TimeoutError extends BaseError {
    constructor(message: string) {
        super(message);
        TimeoutError.setProto(this);
    }
}

export class MessageParseError extends BaseError {
    constructor(message: string) {
        super(message);
        MessageParseError.setProto(this);
    }
}

export interface IInteractiveError {
    code: number;
    message: string;
    path?: string;
}

export module InteractiveError {
    export class Base extends BaseError {
        constructor(message: string, public code: number) {
            super(message);
            Base.setProto(this);
        }
    }

    export const errors: { [code: number]: typeof Base } = {};

    export const startOfRange = 4000;

    export function fromSocketMessage(error: IInteractiveError): Base {
        if (errors[error.code]) {
            return new errors[error.code](error.message, error.code);
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

    export class InvalidPayload extends Base {
        constructor(message: string) {
            super(message, 4000);
            InvalidPayload.setProto(this);
        }
    }
    errors[4000] = InvalidPayload;

    export class PayloadDecompression extends Base {
        constructor(message: string) {
            super(message, 4001);
            PayloadDecompression.setProto(this);
        }
    }
    errors[4001] = PayloadDecompression;

    export class UnknownPacketType extends Base {
        constructor(message: string) {
            super(message, 4002);
            UnknownPacketType.setProto(this);
        }
    }
    errors[4002] = UnknownPacketType;

    export class UnknownMethodName extends Base {
        constructor(message: string) {
            super(message, 4003);
            UnknownMethodName.setProto(this);
        }
    }
    errors[4003] = UnknownMethodName;

    export class InvalidMethodArguments extends Base {
        constructor(message: string) {
            super(message, 4004);
            InvalidMethodArguments.setProto(this);
        }
    }
    errors[4004] = InvalidMethodArguments;

    export class EtagMismatch extends Base {
        constructor(message: string) {
            super(message, 4005);
            EtagMismatch.setProto(this);
        }
    }
    errors[4005] = EtagMismatch;

    export class InvalidTransactionId extends Base {
        constructor(message: string) {
            super(message, 4006);
            InvalidTransactionId.setProto(this);
        }
    }

    errors[4006] = InvalidTransactionId;

    export class NotEnoughSparks extends Base {
        constructor(message: string) {
            super(message, 4007);
            NotEnoughSparks.setProto(this);
        }
    }

    errors[4007] = NotEnoughSparks;

    export class UnknownGroup extends Base {
        constructor(message: string) {
            super(message, 4008);
            UnknownGroup.setProto(this);
        }
    }

    errors[4008] = UnknownGroup;

    export class GroupAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4009);
            GroupAlreadyExists.setProto(this);
        }
    }

    errors[4009] = GroupAlreadyExists;

    export class UnknownSceneId extends Base {
        constructor(message: string) {
            super(message, 4010);
            UnknownSceneId.setProto(this);
        }
    }

    errors[4010] = UnknownSceneId;

    export class SceneAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4011);
            SceneAlreadyExists.setProto(this);
        }
    }

    errors[4011] = SceneAlreadyExists;

    export class UnknownControlId extends Base {
        constructor(message: string) {
            super(message, 4012);
            UnknownControlId.setProto(this);
        }
    }

    errors[4012] = UnknownControlId;

    export class ControlAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4013);
            ControlAlreadyExists.setProto(this);
        }
    }

    errors[4013] = ControlAlreadyExists;

    export class UnknownControlType extends Base {
        constructor(message: string) {
            super(message, 4014);
            UnknownControlType.setProto(this);
        }
    }

    errors[4014] = UnknownControlType;

    export class UnknownParticipant extends Base {
        constructor(message: string) {
            super(message, 4015);
            UnknownParticipant.setProto(this);
        }
    }
    errors[4015] = UnknownParticipant;

    export class SessionClosing extends Base {
        constructor(message: string) {
            super(message, 4016);
            SessionClosing.setProto(this);
        }
    }
    errors[4016] = SessionClosing;

    export class OutOfMemory extends Base {
        constructor(message: string) {
            super(message, 4017);
            OutOfMemory.setProto(this);
        }
    }
    errors[4017] = OutOfMemory;

    export class CannotDeleteDefault extends Base {
        constructor(message: string) {
            super(message, 4018);
            CannotDeleteDefault.setProto(this);
        }
    }
    errors[4018] = CannotDeleteDefault;

    /**
     * CannotAuthenticate occurs when the server fails to autenticate the client.
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
     * ChannelNotInteractive occurs when you try to connect to a channel that is not interactive.
     */
    export class ChannelNotInteractive extends Base {
        constructor(message: string) {
            super(message, 4021);
            ChannelNotInteractive.setProto(this);
        }
    }
    errors[4021] = ChannelNotInteractive;

    /**
     * SessionConflict occurs when the server detects a conflicting connection from the client.
     * This can occur if the requested channel is already interactive or as a participant if
     * you're already connected to a channel.
     */
    export class SessionConflict extends Base {
        constructor(message: string) {
            super(message, 4022);
            SessionConflict.setProto(this);
        }
    }
    errors[4022] = SessionConflict;

    export class BadUserInput extends Base {
        constructor(message: string) {
            super(message, 4999);
            BadUserInput.setProto(this);
        }
    }

    errors[4999] = BadUserInput;
}
