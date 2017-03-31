import deepmerge = require('deepmerge'); //tslint:disable-line no-require-imports import-name
/**
 * Emulates lodash merge using deepmerge which doesnt mutate the source.
 * So we...uh, make it mutate the source \o/
 */
export function merge<T>(x: T, y: T): T {
    return Object.assign(x, deepmerge(x, y));
}
