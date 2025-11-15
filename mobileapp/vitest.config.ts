import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			coverage: {
				enabled: true,
				include: ['src/lib/components/**/*.svelte']
			},
			environment: 'jsdom',
			globals: true,
			include: ['src/test/unit/**/*.test.ts'],
			setupFiles: './vitest.setup.ts'
		}
	})
);
