export class BaseError extends Error {
    constructor(public message: string) {
        super(message);
    }
}

export class CancelledError extends BaseError {
    constructor() {
        super('Packet was cancelled or socket was closed before a reply was received.');
    }
}

export class TimeoutError extends BaseError {
}

export class MessageParseError extends BaseError {
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
        }
    }

    const errors: { [code: number]: typeof Base } = {};

    export function fromSocketMessage(error: IInteractiveError): Base {
        if (errors[error.code]) {
            return new errors[error.code](error.message, error.code);
        }

        return new Base(error.message, error.code);
    }

    export class InvalidPayload extends Base {
        constructor(message: string) {
            super(message, 4000);
        }
    }
    errors[4000] = InvalidPayload;

    export class PayloadDecompression extends Base {
        constructor(message: string) {
            super(message, 4001);
        }
    }
    errors[4001] = PayloadDecompression;

    export class UnknownPacketType extends Base {
        constructor(message: string) {
            super(message, 4002);
        }
    }
    errors[4002] = UnknownPacketType;

    export class UnknownMethodName extends Base {
        constructor(message: string) {
            super(message, 4003);
        }
    }
    errors[4003] = UnknownMethodName;

    export class InvalidMethodArguments extends Base {
        constructor(message: string) {
            super(message, 4004);
        }
    }
    errors[4004] = InvalidMethodArguments;

    export class EtagMismatch extends Base {
        constructor(message: string) {
            super(message, 4005);
        }
    }
    errors[4005] = EtagMismatch;

    export class InvalidTransactionId extends Base {
        constructor(message: string) {
            super(message, 4007);
        }
    }

    errors[4007] = InvalidTransactionId;

    export class NotEnoughSparks extends Base {
        constructor(message: string) {
            super(message, 4008);
        }
    }

    errors[4008] = NotEnoughSparks;

    export class UnknownGroup extends Base {
        constructor(message: string) {
            super(message, 4009);
        }
    }

    errors[4009] = UnknownGroup;

    export class GroupAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4010);
        }
    }

    errors[4010] = GroupAlreadyExists;

    export class UnknownSceneId extends Base {
        constructor(message: string) {
            super(message, 4011);
        }
    }

    errors[4011] = UnknownSceneId;

    export class SceneAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4012);
        }
    }

    errors[4012] = SceneAlreadyExists;

    export class UnkownControlId extends Base {
        constructor(message: string) {
            super(message, 4013);
        }
    }

    errors[4013] = UnkownControlId;

    export class ControlAlreadyExists extends Base {
        constructor(message: string) {
            super(message, 4014);
        }
    }

    errors[4014] = ControlAlreadyExists;

    export class UnkownControlType extends Base {
        constructor(message: string) {
            super(message, 4015);
        }
    }

    errors[4015] = UnkownControlType;
}
