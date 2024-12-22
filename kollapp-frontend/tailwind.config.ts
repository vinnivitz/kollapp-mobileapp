import typography from '@tailwindcss/typography';
import scrollbarHide from 'tailwind-scrollbar-hide';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [typography, scrollbarHide]
} satisfies Config;
