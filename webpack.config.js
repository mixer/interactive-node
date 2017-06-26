('use strict');
const path = require('path');
module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    plugins: [],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'interactive.js',
        library: 'interactive',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
    },
    module: {
        loaders: [{ test: /\.ts$/, loader: 'awesome-typescript-loader' }],
    },
};
