module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [],
  extends: [
    'react-app',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:json/recommended',
    'plugin:jest/recommended',
    'plugin:testing-library/recommended',
    'plugin:jest-dom/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  settings: {
    react: {
      version: '17.0.2',
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  globals: {
    fetch: true,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    'no-plusplus': 0,
    'spaced-comment': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'react/prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    'react/destructuring-assignment': 'off',
    'class-methods-use-this': 'off',
    'for-direction': 'off',
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'max-classes-per-file': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/require-default-props': 'off',
    'arrow-body-style': 'off',
    'jest-dom/prefer-in-document': 'off',
  },
};
