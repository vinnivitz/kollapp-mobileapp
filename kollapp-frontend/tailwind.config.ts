import typography from '@tailwindcss/typography';
import scrollbarHide from 'tailwind-scrollbar-hide';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {}
	},
	plugins: [
		typography,
		scrollbarHide,
		function ({ addVariant }) {
			addVariant('fancy', '&:is(.fancy *)');
		}
	]
} satisfies Config;
