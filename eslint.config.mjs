import js from '@eslint/js'
import nodePlugin from 'eslint-plugin-n'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginSortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
	{
		ignores: ['**/dist', '**/node_modules'],
	},
	eslintPluginPrettierRecommended,
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			nodePlugin.configs['flat/recommended'],
			eslintPluginPrettierRecommended,
		],
		files: ['src/**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
			globals: globals.browser,
		},
		plugins: {
			'sort-destructure-keys': eslintPluginSortDestructureKeys,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-floating-promises': 'error',
			'prettier/prettier': 'error',
			curly: 'error',
			'no-extra-semi': 'off',
			'n/no-unsupported-features/es-syntax': [
				'error',
				{
					ignores: ['modules'],
				},
			],
			'no-use-before-define': 'off',
			'no-warning-comments': [
				'error',
				{
					terms: ['nocommit', '@nocommit', '@no-commit'],
				},
			],
			'no-unused-vars': 'off',
			'n/no-missing-import': 'off',
			'sort-destructure-keys/sort-destructure-keys': 'error',
		},
	},
)
