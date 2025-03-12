import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true
	},

	kit: {
		adapter: adapter({
			assets: 'build',
			fallback: 'index.html',
			pages: 'build',
			precompress: false,
			strict: true
		})
	},
	preprocess: vitePreprocess({ script: true })
};

export default config;
