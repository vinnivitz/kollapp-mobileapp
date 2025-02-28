/**
 * Enum for all the routes in the application
 */
export const PageRoute = {
	HOME: '/',
	FINANCES: '/finances',
	ACCOUNT: {
		ROOT: '/account',
		APP: '/account/app',
		CHANGE_PASSWORD: '/account/change-password',
		UPDATE_DATA: '/account/update-data',
		DELETE_ACCOUNT: '/account/delete'
	},
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		RESET_PASSWORD: '/auth/reset-password',
		RESEND_CONFIRMATION: '/auth/resend-confirmation'
	},
	ORGANIZATION: {
		ROOT: '/organization',
		UPDATE_INFO: '/organization/update-info'
	}
} as const;
