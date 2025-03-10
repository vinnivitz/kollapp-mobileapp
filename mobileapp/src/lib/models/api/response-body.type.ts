import type { ValidationCode } from '$lib/models/api';

/**
 * Server response body
 */
export type ResponseBody<T = never> = {
	status: number;
	message?: string;
	data: T;
	validationField?: string;
	validationCode?: ValidationCode;
};
