import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	ssr: {
		noExternal: ['@ionic/core']
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
