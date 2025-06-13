import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import sveltePlugin from 'eslint-plugin-svelte';
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
								'$lib/models/preferences/*',
								'$lib/models/routing/*',
								'$lib/models/stores/*',
								'$lib/models/ui/*',
								'$lib/utility/*',
								'$lib/stores/*',
								'$lib/locales/*'
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
			'security/detect-non-literal-fs-filename': 'off',
			'sonarjs/no-unused-collection': 'off',
			'sonarjs/no-use-of-empty-return-value': 'off',
			'sonarjs/slow-regex': 'off',
			'sonarjs/void-use': 'off',
			'svelte/no-unused-svelte-ignore': 'off',
			'svelte/prefer-writable-derived': 'off',
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
				HTMLIonCardElement: 'readonly',
				HTMLIonCardTitleElement: 'readonly',
				HTMLIonDatetimeElement: 'readonly',
				HTMLIonItemSlidingElement: 'readonly',
				HTMLIonListElement: 'readonly',
				HTMLIonLoadingElement: 'readonly',
				HTMLIonMenuElement: 'readonly',
				HTMLIonModalElement: 'readonly',
				HTMLIonRefresherElement: 'readonly',
				HTMLIonSearchbarElement: 'readonly',
				HTMLIonTabsElement: 'readonly',
				HTMLIonToggleElement: 'readonly',
				NodeListOf: 'readonly'
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
			'static/*',
			'coverage/',
			'src/lib/locales/de.json',
			'src/lib/locales/en.json',
			'coverage/'
		]
	}
);
