module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  globals: {
    __ENV: 'readonly',
    __ITER: 'readonly',
    __VU: 'readonly',
  },
  ignorePatterns: ['node_modules/*', 'screenshots/*', 'lib/external/*'],
  rules: {
    'prettier/prettier': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    'function-paren-newline': ['off'],
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
  },
};
