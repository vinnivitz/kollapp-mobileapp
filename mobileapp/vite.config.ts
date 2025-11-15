import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	ssr: {
		noExternal: ['@ionic/core']
	}
});
