const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
    plugins: [new CleanWebpackPlugin()],
  };
};
