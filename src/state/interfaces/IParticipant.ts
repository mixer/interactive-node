import { IMeta } from './controls/IMeta';

export interface IParticipant {
    sessionID: string;
    userID?: number;
    username?: string;
    level?: number;
    lastInputAt?: number;
    connectedAt?: number;
    disable?: boolean;
    groupID?: string;
    meta?: IMeta;
}
