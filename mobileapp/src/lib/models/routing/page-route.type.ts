/**
 * Enum for all the routes in the application
 */
export const PageRoute = {
	ACCOUNT: {
		APP: '/account/app',
		DELETE: '/account/delete',
		PRIVACY_AND_SECURITY: {
			BIOMETRICS: '/account/privacy-and-security/biometrics',
			CHANGE_PASSWORD: '/account/privacy-and-security/change-password',
			LEGAL: '/account/privacy-and-security/legal',
			NOTIFICATIONS: '/account/privacy-and-security/notifications',
			ROOT: '/account/privacy-and-security'
		},
		ROOT: '/account',
		UPDATE_DATA: '/account/update-data'
	},
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		REGISTER_ORGANIZATION: '/auth/register-organization',
		RESEND_CONFIRMATION: '/auth/resend-confirmation',
		RESET_PASSWORD: '/auth/reset-password',
		ROOT: '/auth'
	},
	FINANCES: '/finances',
	HOME: '/',
	ORGANIZATION: {
		ACTIVITIES: '/organization/activities',
		JOIN: '/organization/join',
		LEAVE: '/organization/leave',
		MEMBERS: '/organization/members',
		REGISTER: '/organization/register',
		ROOT: '/organization',
		UPDATE_DATA: '/organization/update-data'
	}
} as const;
