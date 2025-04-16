const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  const pattern = env && env.entryPattern ? env.entryPattern : './src/tests/**/*.test.js';
  const files = glob.sync(pattern);

  if (files.length === 0) {
    console.error(`No files found matching pattern: ${pattern}`);
    process.exit(1);
  }

  const entry = files.reduce((acc, file) => {
    const name = path.basename(file, path.extname(file)); // Use the file name without extension
    acc[name] = file;
    return acc;
  }, {});

  return {
    mode: 'production',
    entry,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'commonjs',
    },
    module: {
      rules: [{ test: /\.js$/, use: 'babel-loader' }],
    },
    stats: {
      colors: true,
      warnings: false,
    },
    target: 'web',
    externals: /k6(\/.*)?/,
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/static-data/customers.csv'),
            to: path.resolve(__dirname, 'dist/static-data/customers.csv'),
          },
          {
            from: path.resolve(__dirname, 'src/static-data/concrete_products.csv'),
            to: path.resolve(__dirname, 'dist/static-data/concrete_products.csv'),
          },
          {
            from: path.resolve(__dirname, 'src/static-data/abstract_products.csv'),
            to: path.resolve(__dirname, 'dist/static-data/abstract_products.csv'),
          },
        ],
      }),
    ],
  };
};
