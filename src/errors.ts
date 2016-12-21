export class BaseError extends Error {
    constructor(public message) {
        super(message);
    }
}

export class CancelledError extends BaseError {
    constructor() {
        super("Packet was cancelled or Carina was closed before a reply was received.");
    }
}

export class TimeoutError extends BaseError {
}

export class MessageParseError extends BaseError {
}

export module ConstellationError {
    export class Base extends BaseError {
        constructor(public code: number, message: string) {
            super(message);
        }
    }

    const errors = {};

    export function from({ code, message }: { code: number, message: string }) {
        if (errors[code]) {
            return new errors[code](message);
        }

        return new Base(code, message);
    }

    export class InvalidPayload extends Base {
        constructor(message: string) {
            super(4000, message);
        }
    }
    errors[4000] = InvalidPayload;

    export class PayloadDecompression extends Base {
        constructor(message: string) {
            super(4001, message);
        }
    }
    errors[4001] = PayloadDecompression;

    export class UnknownPacketType extends Base {
        constructor(message: string) {
            super(4002, message);
        }
    }
    errors[4002] = UnknownPacketType;

    export class UnknownMethodName extends Base {
        constructor(message: string) {
            super(4003, message);
        }
    }
    errors[4003] = UnknownMethodName;

    export class InvalidMethodArguments extends Base {
        constructor(message: string) {
            super(4004, message);
        }
    }
    errors[4004] = InvalidMethodArguments;

    export class SessionExpired extends Base {
        constructor(message: string) {
            super(4005, message);
        }
    }
    errors[4005] = SessionExpired;

    export class LiveUnknownEvent extends Base {
        constructor(message: string) {
            super(4106, message);
        }
    }
    errors[4106] = LiveUnknownEvent;

    export class LiveAccessDenied extends Base {
        constructor(message: string) {
            super(4107, message);
        }
    }
    errors[4107] = LiveAccessDenied;

    export class LiveAlreadySubscribed extends Base {
        constructor(message: string) {
            super(4108, message);
        }
    }
    errors[4108] = LiveAlreadySubscribed;

    export class LiveNotSubscribed extends Base {
        constructor(message: string) {
            super(4109, message);
        }
    }
    errors[4109] = LiveNotSubscribed;
}
