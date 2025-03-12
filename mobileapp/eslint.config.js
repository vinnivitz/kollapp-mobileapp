import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import sortPlugin from 'eslint-plugin-sort';
import sveltePlugin from 'eslint-plugin-svelte';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	ts.configs.recommended,
	sveltePlugin.configs['flat/recommended'],
	prettier,
	sveltePlugin.configs['flat/prettier'],
	securityPlugin.configs.recommended,
	tailwindcssPlugin.configs['flat/recommended'],
	unicornPlugin.configs['flat/recommended'],
	sonarjsPlugin.configs.recommended,
	sortPlugin.configs['flat/recommended'],
	{
		plugins: {
			import: importPlugin
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_'
				}
			],
			'import/no-duplicates': 'error',
			'import/order': [
				'error',
				{
					alphabetize: {
						caseInsensitive: true,
						order: 'asc'
					},

					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],

					'newlines-between': 'always',
					pathGroups: [
						{
							group: 'internal',
							pattern: '$app/**',
							position: 'after'
						}
					],

					pathGroupsExcludedImportTypes: ['builtin']
				}
			],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'$lib/models/models/*',
								'$lib/models/ui/*',
								'$lib/models/routing/*',
								'$lib/models/api/*',
								'$lib/models/preferences/*',
								'$lib/models/stores/*',
								'$lib/utils/*',
								'$lib/stores/*'
							],
							message: 'Please import from the index file.'
						}
					]
				}
			],
			'security/detect-non-literal-fs-filename': 'off',
			'sonarjs/no-unused-collection': 'off',
			'sonarjs/no-use-of-empty-return-value': 'off',
			'sonarjs/slow-regex': 'off',
			'sonarjs/void-use': 'off',
			'sort/imports': 'off',
			'sort/string-enums': 'error',
			'sort/string-unions': 'error',
			'sort/type-properties': 'error',
			'svelte/no-unused-svelte-ignore': 'off',
			'svelte/valid-compile': 'off',
			'unicorn/filename-case': 'off'
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.svelte']
			}
		}
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				HTMLIonDatetimeElement: 'readonly',
				HTMLIonLoadingElement: 'readonly',
				HTMLIonMenuElement: 'readonly',
				HTMLIonRefresherElement: 'readonly',
				HTMLIonTabsElement: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'docs/',
			'assets/',
			'android/',
			'icons/',
			'node_modules/',
			'test-results/',
			'.env',
			'vite.config.ts.*',
			'static/'
		]
	}
);
