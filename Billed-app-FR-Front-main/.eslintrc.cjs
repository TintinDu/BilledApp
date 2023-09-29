module.exports = {
  env: {
    browser: true,
    es2023: true,
  },
  extends: 'airbnb-base',
  plugins: ['jest'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { 'jest/globals': true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/no-mocks-import': 'off',
      },
    },
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 'off',
  },
  globals: {
    jQuery: true,
  },
};
