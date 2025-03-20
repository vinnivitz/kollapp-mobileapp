import type { Config } from 'tailwindcss';

import typography from '@tailwindcss/typography';
import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
	content: ['./src/**/*.{svelte,ts}'],
	plugins: [
		typography,
		scrollbarHide,
		({ addVariant }) => {
			addVariant('light', '&:is(.light *)');
			addVariant('dark', '&:is(.dark *)');
			addVariant('black-and-white', '&:is(.black-and-white *)');
		}
	]
} satisfies Config;
