const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.expo/',
      'web-build/',
      'coverage/',
    ],
  },
  ...expoConfig,
  prettierConfig,
]);
