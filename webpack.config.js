'use strict';

module.exports = {
    entry: './src',
    devtool: 'source-map',
    output: {
        path: './dist',
        filename: 'interactive.js',
        library: 'interactive',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
    },
    module: {
        loaders: [
            { test: /\.json$/, loaders: ['json'] },
            { test: /\.ts$/, loader: 'awesome-typescript-loader' },
        ]
    },
}
