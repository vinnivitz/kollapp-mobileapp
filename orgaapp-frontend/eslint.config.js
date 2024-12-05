import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';
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
	// { HTMLIonTabsElement: 'readonly' },
	{
		plugins: {
			import: importPlugin
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.svelte']
			}
		},
		rules: {
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],

					pathGroups: [
						{
							pattern: '$app/**',
							group: 'internal',
							position: 'after'
						}
					],

					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',

					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			],
			'unicorn/filename-case': 'off'
		}
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
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
			'node/',
			'node_modules/',
			'test-results/',
			'.env',
			'vite.config.ts.*'
		]
	}
);
