import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '18' },
    },
    plugins: {
      'react-hooks': reactHooks,
      'next': nextPlugin,
    },
    ignores: [
      '.next/',
      'node_modules/',
      'out/',
      'build/',
      'dist/',
      'coverage/',
      '*.d.ts',
      'prisma/migrations/',
      '.next-env.d.ts',
      '*.config.js',
      '*.config.ts',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-var': 'off',
    },
  },
  {
    files: ['tests/**/*'],
    rules: {
      'no-var': 'off',
    },
  },
);
