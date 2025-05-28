const path = require('path');
const glob = require('glob');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = (env = {}) => {
  // Extract parameters from env
  const entryTags = env.entryTags ? env.entryTags.split(',') : [];
  const testType = env.testType;
  const repositoryId = env.repositoryId;

  const envVars = {};

  Object.keys(process.env).forEach(key => {
    if (key.startsWith('SPRYKER_') || key.startsWith('K6_')) {
      envVars[key] = process.env[key];
    }
  });

  if (testType) {
    envVars.SPRYKER_TEST_TYPE = testType;
  }

  if (repositoryId) {
    envVars.SPRYKER_REPOSITORY_ID = repositoryId;
  }

  console.log('Environment variables for webpack:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  const files = glob.sync('./src/tests/**/*.test.js');
  let filteredFiles = files;

  if (entryTags.length > 0) {
    filteredFiles = files.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const firstLine = content.split('\n')[0];

        if (!firstLine.includes('tags:')) {
          return false;
        }

        const tagLine = firstLine.split('tags:')[1].trim();
        const fileTags = tagLine.split(',').map(tag => tag.trim());

        return entryTags.every(tag => fileTags.includes(tag));
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        return false;
      }
    });
  }

  if (filteredFiles.length === 0) {
    const tagsInfo = entryTags.length > 0 ? ` with tags: ${entryTags.join(', ')}` : '';
    console.error(`No test files found${tagsInfo}`);
    process.exit(1);
  }

  const entry = filteredFiles.reduce((acc, file) => {
    const name = path.basename(file, path.extname(file));
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
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "assert": require.resolve("assert/"),
        "fs": require.resolve("browserify-fs"),
        "buffer": require.resolve("buffer/"),
        "stream": require.resolve("stream-browserify")
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets/fixtures/customers.csv'),
            to: path.resolve(__dirname, 'dist/assets/fixtures/customers.csv'),
          },
          {
            from: path.resolve(__dirname, 'src/assets/fixtures/concrete_products.csv'),
            to: path.resolve(__dirname, 'dist/assets/fixtures/concrete_products.csv'),
          },
          {
            from: path.resolve(__dirname, 'src/assets/fixtures/abstract_products.csv'),
            to: path.resolve(__dirname, 'dist/assets/fixtures/abstract_products.csv'),
          },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars),
        __ENV: JSON.stringify(envVars)
      }),
    ],
  };
};
