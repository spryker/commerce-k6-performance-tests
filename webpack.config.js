const path = require('path');
const glob = require('glob');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  let pattern = env && env.entryPattern ? env.entryPattern : './src/tests/**/*.test.js';
  const entryTag = env && env.entryTag;
  
  const files = glob.sync(pattern);
  
  let filteredFiles = files;
  
  // Filter files by tag if entryTag is provided
  if (entryTag) {
    filteredFiles = files.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const firstLine = content.split('\n')[0];
        return firstLine.includes(`tags:`) && firstLine.includes(entryTag);
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        return false;
      }
    });
  }

  if (filteredFiles.length === 0) {
    console.error(`No files found matching pattern: ${pattern}${entryTag ? ` with tag: ${entryTag}` : ''}`);
    process.exit(1);
  }

  const entry = filteredFiles.reduce((acc, file) => {
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
