import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import sveltePlugin from 'eslint-plugin-svelte';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	sveltePlugin.configs.recommended,
	prettier,
	...sveltePlugin.configs.prettier,
	// securityPlugin.configs.recommended,
	unicornPlugin.configs.recommended,
	sonarjsPlugin.configs.recommended,
	{
		plugins: {
			import: importPlugin,
			perfectionist: perfectionistPlugin
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true
				}
			],
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
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

					groups: ['type', 'builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],

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
								'$lib/models/api/*',
								'$lib/models/models/*',
								'$lib/models/osm/*',
								'$lib/models/storage/*',
								'$lib/models/stores/*',
								'$lib/models/ui/*',
								'$lib/utility/*',
								'$lib/stores/*',
								'$lib/locales/*',
								'$lib/components/**/*.ts',
								'$lib/api/services/*',
								'$lib/api/dtos/*',
								'$lib/api/schemas/organization/*',
								'$lib/api/schemas/user/*',
								'$lib/api/schemas/authentication/*',
								'$lib/api/schemas/budget/*'
							],
							message: 'Please import from the index file.'
						}
					]
				}
			],
			'perfectionist/sort-array-includes': 'error',
			'perfectionist/sort-enums': 'error',
			'perfectionist/sort-exports': 'error',
			'perfectionist/sort-named-exports': 'error',
			'perfectionist/sort-named-imports': 'error',
			'perfectionist/sort-object-types': [
				'error',
				{ groups: ['required-property', 'optional-property', 'required-method', 'optional-method'] }
			],
			'perfectionist/sort-objects': 'error',
			'perfectionist/sort-union-types': 'error',
			'sonarjs/no-unused-collection': 'off',
			'sonarjs/no-use-of-empty-return-value': 'off',
			'sonarjs/slow-regex': 'off',
			'sonarjs/unused-import': 'off',
			'sonarjs/void-use': 'off',
			'svelte/event-directive-deprecated': 'off',
			'svelte/no-unused-svelte-ignore': 'off',
			'svelte/prefer-writable-derived': 'off',
			'svelte/valid-compile': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/prefer-structured-clone': 'off'
		}
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				ApexAxisChartSeries: 'readonly',
				ApexNonAxisChartSeries: 'readonly',
				HTMLIonCardElement: 'readonly',
				HTMLIonCardTitleElement: 'readonly',
				HTMLIonDatetimeElement: 'readonly',
				HTMLIonFabElement: 'readonly',
				HTMLIonInfiniteScrollContentElement: 'readonly',
				HTMLIonInfiniteScrollElement: 'readonly',
				HTMLIonInputElement: 'readonly',
				HTMLIonItemSlidingElement: 'readonly',
				HTMLIonListElement: 'readonly',
				HTMLIonLoadingElement: 'readonly',
				HTMLIonMenuElement: 'readonly',
				HTMLIonModalElement: 'readonly',
				HTMLIonNoteElement: 'readonly',
				HTMLIonRefresherElement: 'readonly',
				HTMLIonSearchbarElement: 'readonly',
				HTMLIonTabsElement: 'readonly',
				HTMLIonToggleElement: 'readonly',
				NodeJS: 'readonly',
				NodeListOf: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				projectService: true,
				svelteConfig
			}
		}
	},
	{
		ignores: [
			'docs/',
			'assets/',
			'android/',
			'icons/',
			'test-results/',
			'.env',
			'src/lib/assets/',
			'src/lib/locales/de.json',
			'src/lib/locales/en.json',
			'static/'
		]
	}
);
