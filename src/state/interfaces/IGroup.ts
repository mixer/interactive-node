import { IMeta } from './controls/IMeta';

export interface IGroupDataArray {
    groups: IGroup[];
}

export interface IGroupDeletionParams {
    groupID: string;
    reassignGroupID: string;
}


export interface IGroup {
    /**
     * The ID of the group.
     */
    groupID?: string;

    /**
     * The scene the group is currently assigned to.
     */
    sceneID?: string;

    /**
     * Metadata associated with the group.
     */
    meta?: IMeta;

    /**
     * The group's resource tag.
     */
    etag?: string;
}
