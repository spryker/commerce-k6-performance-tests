const path = require('path');
const glob = require('glob');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  let pattern = env && env.entryPattern ? env.entryPattern : './src/tests/**/*.test.js';
  const entryTags = env && env.entryTags ? env.entryTags.split(',') : [];
  const entryTag = env && env.entryTag; // Keep for backward compatibility

  const files = glob.sync(pattern);
  
  let filteredFiles = files;
  
  // Filter files by tags if entryTags is provided
  if (entryTags.length > 0 || entryTag) {
    const tagsToCheck = entryTags.length > 0 ? entryTags : [entryTag];

    filteredFiles = files.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const firstLine = content.split('\n')[0];

        if (!firstLine.includes('tags:')) {
          return false;
        }

        // Extract the actual tags from the first line
        const tagLine = firstLine.split('tags:')[1].trim();
        const fileTags = tagLine.split(',').map(tag => tag.trim());

        // Check if ALL of the specified tags are present (for multiple tags)
        // or if the single tag is present (for backward compatibility)
        if (tagsToCheck.length === 1) {
          return fileTags.includes(tagsToCheck[0]);
        } else {
          return tagsToCheck.every(tag => fileTags.includes(tag));
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        return false;
      }
    });
  }

  if (filteredFiles.length === 0) {
    const tagsInfo = entryTags.length > 0
      ? ` with tags: ${entryTags.join(', ')}`
      : entryTag
        ? ` with tag: ${entryTag}`
        : '';
    console.error(`No files found matching pattern: ${pattern}${tagsInfo}`);
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
    ],
  };
};
