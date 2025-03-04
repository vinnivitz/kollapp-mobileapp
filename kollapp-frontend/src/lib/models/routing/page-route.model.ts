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
		UPDATE_DATA: '/organization/update-data'
	}
} as const;

/**
 * Type for all the routes in the application
 */
export type PageRoutePaths = ExtractPaths<typeof PageRoute> | string;

type ExtractPaths<T> = T extends string ? T : { [K in keyof T]: ExtractPaths<T[K]> }[keyof T];
