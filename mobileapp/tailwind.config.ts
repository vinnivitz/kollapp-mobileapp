import type { Config } from 'tailwindcss';

import typography from '@tailwindcss/typography';
import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
	content: ['./src/**/*.{svelte,ts}'],
	plugins: [typography, scrollbarHide]
} satisfies Config;
