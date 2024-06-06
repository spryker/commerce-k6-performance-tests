module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'globals': {
        '__ENV': 'readonly',
        '__ITER': 'readonly',
        '__VU': 'readonly'
    },
    'ignorePatterns': [
        'node_modules/*',
        'screenshots/*',
        'lib/external/*',
    ],
    'rules': {
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': 'error',
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'function-paren-newline': ['error', 'multiline'],
        'max-len': ['error', {'code': 180, 'tabWidth': 4, 'ignoreUrls': true, 'ignoreTemplateLiterals': true, 'ignoreStrings': true, 'ignoreRegExpLiterals': true}]
    }
};