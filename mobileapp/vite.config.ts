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
		coverage: {
			enabled: true,
			/*
			SonarQube does not show the code coverage properly if files are included for code coverage. The better approach
			would be to include all files per default and exclude some.
			 */
			//include: ['src/lib/components/**/*.svelte'],
			reporter: ['lcov', 'text']
		},
		environment: 'jsdom',
		globals: true,
		include: ['src/test/unit/**/*.test.ts'],
		setupFiles: './vitest.setup.ts'
	}
});
