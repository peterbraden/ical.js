module.exports = {
    'env': {
        'commonjs': true,
        'es6': true,
        'node': true
    },
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
        'Promise': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'extends': ['eslint:recommended', 'prettier'],
    'plugins': ['prettier'],
    'rules': {
        'prettier/prettier': ['error'],
        'no-var': 'error', 'prefer-const': 'warn'
    }
};
