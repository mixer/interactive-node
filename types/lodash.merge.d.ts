declare module 'lodash.merge' {
    function merge<TObject, TSource>(
        object: TObject,
        source: TSource
    ): TObject & TSource;

    function merge<TObject, TSource1, TSource2>(
        object: TObject,
        source1: TSource1,
        source2: TSource2
    ): TObject & TSource1 & TSource2;

    function merge<TObject, TSource1, TSource2, TSource3>(
        object: TObject,
        source1: TSource1,
        source2: TSource2,
        source3: TSource3
    ): TObject & TSource1 & TSource2 & TSource3;

    function merge<TObject, TSource1, TSource2, TSource3, TSource4>(
        object: TObject,
        source1: TSource1,
        source2: TSource2,
        source3: TSource3,
        source4: TSource4
    ): TObject & TSource1 & TSource2 & TSource3 & TSource4;

    function merge<TResult>(
        object: any,
        ...otherArgs: any[]
    ): TResult;

    export = merge;
}
