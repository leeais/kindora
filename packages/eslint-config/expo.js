import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for Expo (React Native).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const expoConfig = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
      },
    },
  },
];
