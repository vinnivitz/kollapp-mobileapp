import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			keyframes: {
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: 0 },
					'100%': { transform: 'translateX(0)', opacity: 1 }
				},
				'fade-in': {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 }
				}
			},
			animation: {
				'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
				'fade-in': 'fade-in 1s ease-out forwards'
			}
		}
	}
} satisfies Config;
