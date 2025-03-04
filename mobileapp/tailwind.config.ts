import typography from '@tailwindcss/typography';
import scrollbarHide from 'tailwind-scrollbar-hide';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		typography,
		scrollbarHide,
		function ({ addVariant }) {
			addVariant('light', '&:is(.light *)');
			addVariant('dark', '&:is(.dark *)');
			addVariant('black-and-white', '&:is(.black-and-white *)');
		}
	]
} satisfies Config;
