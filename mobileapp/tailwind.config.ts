import typography from '@tailwindcss/typography';
import * as scrollbarHide from 'tailwind-scrollbar-hide';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	plugins: [
		typography,
		scrollbarHide,
		({ addVariant }) => {
			addVariant('light', '&:is(.light *)');
			addVariant('dark', '&:is(.dark *)');
			addVariant('black-and-white', '&:is(.black-and-white *)');
		}
	],
	theme: {
		extend: {}
	}
} satisfies Config;
