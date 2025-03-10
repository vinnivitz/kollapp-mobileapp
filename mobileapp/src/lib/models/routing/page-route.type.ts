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
		DELETE: '/account/delete'
	},
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		REGISTER_ORGANIZATION: '/auth/register-organization',
		RESET_PASSWORD: '/auth/reset-password',
		RESEND_CONFIRMATION: '/auth/resend-confirmation'
	},
	ORGANIZATION: {
		ROOT: '/organization',
		REGISTER: '/organization/register',
		UPDATE_DATA: '/organization/update-data',
		LEAVE: '/organization/leave',
		JOIN: '/organization/join',
		ACTIVITY: {
			ROOT: '/organization/activity',
			CREATE: '/organization/activity/create'
		}
	}
} as const;
