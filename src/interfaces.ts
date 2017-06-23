export interface IRawValues {
  [key: string]: any;
}
export type JSONPrimitive = boolean | string | number | null;

export interface IJSON {
  [prop: string]: (IJSON | JSONPrimitive) | (IJSON | JSONPrimitive)[];
}
