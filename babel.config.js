module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  generatorOpts: {
    // Increase the threshold from the default 500KB to 1MB or higher
    compact: process.env.NODE_ENV === 'production',
    retainLines: process.env.NODE_ENV !== 'production',
    jsescOption: {
      // Disable deoptimization warnings for large files
      minified: process.env.NODE_ENV === 'production',
    },
    shouldPrintComment: () => false,
    bigIntLiterals: true,
    maxLineLength: 1000000, // Increase this value to prevent deoptimization
  }
};
