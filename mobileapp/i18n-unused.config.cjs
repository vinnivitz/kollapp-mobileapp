/** @type {import('i18n-unused').RunOptions} */
module.exports = {
	localesPath: 'src/lib/locales',
	missedTranslationParser: /\$t\(\s*['"`]([^'"`]+)['"`]/,
	srcExtensions: ['svelte', 'ts'],
	srcPath: 'src',
	translationKeyMatcher: /\$t\([\s\S]*?\)/gi
};
