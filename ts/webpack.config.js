'use strict';

module.exports = {
    entry: './index.ts',
    devtool: 'source-map',
    output: {
        path: '../dist',
        filename: 'carina.js',
        library: 'carina',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
        ]
    },
}