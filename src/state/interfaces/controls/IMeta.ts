export interface IMetaProperty {
    value: any;
    etag: string;
}

export interface IMeta {
    [property: string]: IMetaProperty;
}
