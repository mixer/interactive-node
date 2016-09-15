'use strict';

module.exports = {
    entry: './src',
    devtool: 'source-map',
    output: {
        path: './dist',
        filename: 'carina.js',
        library: 'carina',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
    },
    module: {
        loaders: [
            { test: /\.json$/, loaders: ['json'] },
            { test: /\.ts$/, loader: 'awesome-typescript-loader' },
        ]
    },
}
