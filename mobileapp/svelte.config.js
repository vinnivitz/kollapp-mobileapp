import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const adapter =
	process.env.ADAPTER === 'static'
		? adapterStatic({
				assets: 'build',
				fallback: 'index.html',
				pages: 'build',
				precompress: false,
				strict: true
			})
		: adapterNode();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true
	},

	kit: {
		adapter
	},
	preprocess: vitePreprocess({ script: true, style: true })
};

export default config;
