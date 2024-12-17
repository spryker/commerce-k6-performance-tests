const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        SAPI7_checkout_1: './src/tests/checkout/SAPI7_checkout_1.test.js',
        SAPI9_checkout_70: './src/tests/checkout/SAPI9_checkout_70.test.js',
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].test.js',
        libraryTarget: 'commonjs'
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader' },
        ]
    },
    stats: {
        colors: true,
        warnings: false
    },
    target: 'web',
    externals: /k6(\/.*)?/,
    devtool: 'source-map',
    plugins: [
        new CleanWebpackPlugin(),
    ],
}
