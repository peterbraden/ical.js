module.exports = {
    'env': {
        'commonjs': true,
        'node': true
    },
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2015
    },
    'extends': ['eslint:recommended', 'airbnb/base', 'prettier'],
    'plugins': ['prettier', 'es5'],
    'rules': {
        'prettier/prettier': ['error']
    }
};
