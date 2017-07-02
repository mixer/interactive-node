import { IJSON, JSONPrimitive } from '../../../interfaces';
import { ETag } from './';

/**
 * An IMeta property is one property within an IMeta map.
 * It contains a value and an Etag.
 */
export interface IMetaProperty {
    value: IJSON | JSONPrimitive;
    /** @deprecated etags are no longer used, you can always omit/ignore this */
    etag?: ETag;
}

/**
 * Meta is a map of custom property names.
 * The values can be any valid JSON type.
 *
 * Meta properties allow you to store custom Metadata on their attached interactive
 * state element.
 */
export interface IMeta {
    [property: string]: IMetaProperty;
}
