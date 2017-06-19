declare module 'json-stringify-safe' {
    function stringify(
        obj: object,
        replacer?: (number | string)[] | null,
        space?: string | number,
        decycler: (key:string, value: any) => any
    ): string

    export = stringify;
}
