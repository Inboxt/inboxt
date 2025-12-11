import js from '@eslint/js';
import globals from 'globals';
import { fileURLToPath } from 'url';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'apps/web/src/lib/graphql/generated/**',
			'apps/web/src/lib/graphql/client.ts',
			'apps/web/codegen.ts',
			'apps/api/prisma/**',
			'apps/api/migrations/**',
		],
	},
	eslintPluginPrettierRecommended,

	// base config
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			curly: ['error', 'all'],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},

	// web config
	{
		files: ['apps/web/**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			import: importPlugin,
		},
		languageOptions: {
			parserOptions: {
				project: ['./apps/web/tsconfig.app.json', './apps/web/tsconfig.node.json'],
				tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'@typescript-eslint/only-throw-error': 'off',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'import/order': [
				'error',
				{
					groups: [
						['builtin', 'external'],
						'internal',
						'parent',
						'sibling',
						'index',
						'type',
					],
					'newlines-between': 'always',
					pathGroups: [
						{
							pattern: '@inboxt/**',
							group: 'internal',
							position: 'after',
						},
						{
							pattern: '~**/**',
							group: 'internal',
							position: 'after',
						},
					],
					pathGroupsExcludedImportTypes: ['type'],
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},

	// api config
	{
		files: ['apps/api/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			parserOptions: {
				project: ['./apps/api/tsconfig.json'],
				tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-extraneous-class': [
				'error',
				{
					allowWithDecorator: true,
				},
			],
		},
	},
);
