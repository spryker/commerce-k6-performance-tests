module.exports = {
    mode: 'production',
    entry: {
        SAPI7_checkout_70: './src/tests/checkout/SAPI7_checkout_70.test.js',
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
}
