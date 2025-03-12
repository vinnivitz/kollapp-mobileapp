/**
 * Enum for all the routes in the application
 */
export const PageRoute = {
	ACCOUNT: {
		APP: '/account/app',
		CHANGE_PASSWORD: '/account/change-password',
		DELETE: '/account/delete',
		ROOT: '/account',
		UPDATE_DATA: '/account/update-data'
	},
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		REGISTER_ORGANIZATION: '/auth/register-organization',
		RESEND_CONFIRMATION: '/auth/resend-confirmation',
		RESET_PASSWORD: '/auth/reset-password'
	},
	FINANCES: '/finances',
	HOME: '/',
	ORGANIZATION: {
		ACTIVITY: {
			CREATE: '/organization/activity/create',
			ROOT: '/organization/activity'
		},
		JOIN: '/organization/join',
		LEAVE: '/organization/leave',
		REGISTER: '/organization/register',
		ROOT: '/organization',
		UPDATE_DATA: '/organization/update-data'
	}
} as const;
