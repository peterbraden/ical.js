module.exports = {
    'env': {
        'commonjs': true,
        'node': true
    },
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
        'Promise': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2015
    },
    'extends': ['eslint:recommended', 'prettier', 'plugin:es5/no-es2015'],
    'plugins': ['prettier', 'es5'],
    'rules': {
        'prettier/prettier': ['error']
    }
};
