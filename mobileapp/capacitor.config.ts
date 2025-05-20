import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'org.kollapp.app',
	appName: 'Kollapp',
	plugins: {
		SplashScreen: {
			androidScaleType: 'CENTER_CROP',
			backgroundColor: '#121212',
			launchAutoHide: false
		}
	},
	webDir: 'build'
};

export default config;
