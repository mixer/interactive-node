import { ETag } from './controls';
import { IMeta } from './controls/IMeta';

export interface IParticipantArray {
    participants: IParticipant[];
}

export interface IParticipant {
    /**
     * a unique string identifier for the user in this session. It’s
     * used for all participant identification internally, and
     * should be viewed as an opaque token.
     */
    sessionID: string;
    /**
     * This participant's Mixer UserId
     */
    userID?: number;
    /**
     * This participant's Mixer Username
     */
    username?: string;
    /**
     * This participant's Mixer level
     */
    level?: number;
    /**
     * The unix milliseconds timestamp when the user last
     * interacted with the controls.
     */
    lastInputAt?: number;
    /**
     * The unix milliseconds timestamp when the user connected
     */
    connectedAt?: number;
    /**
     * The disabled state of this participant, when disabled they cannot provide input
     */
    disabled?: boolean;
    /**
     * The ID of the Group this user belongs to
     */
    groupID?: string;
    meta?: IMeta;
    /**
     * The participant's ETag.
     */
    etag?: ETag;
}
