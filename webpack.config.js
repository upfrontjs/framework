const path = require('path');
const packageJson = require('./package.json');
const vendorDependencies = Object.keys(packageJson['dependencies']);

// todo - https://github.com/TypeStrong/ts-loader#babel
module.exports = {
    entry: {
        main: './src/index.ts',
        vendor: vendorDependencies
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[chunkhash].js',
        path: path.resolve(__dirname, 'lib'),
        library: 'Upfront'
    },
};
