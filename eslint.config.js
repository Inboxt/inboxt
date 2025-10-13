import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
	{ ignores: ['dist', '**/node_modules'] },
	eslintPluginPrettierRecommended,

	// base config
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-confusing-void-expression': [
				'error',
				{ ignoreArrowShorthand: true },
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
				tsconfigRootDir: new URL('.', import.meta.url),
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'no-throw-literal': 'off',
			'@typescript-eslint/only-throw-error': 'off',
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allowAny: true,
					allowBoolean: true,
					allowNullish: true,
					allowNumber: true,
					allowRegExp: true,
				},
			],
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			curly: ['error', 'all'],
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
		files: ['apps/api/**/*.{ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			parserOptions: {
				project: ['./apps/api/tsconfig.json'],
				tsconfigRootDir: new URL('.', import.meta.url),
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
		},
	},
);
