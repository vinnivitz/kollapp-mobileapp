import type { ValidationCode } from '$lib/models/api';

/**
 * Server response body
 */
export type ResponseBody<T = never> = {
	data: T;
	message?: string;
	status: number;
	validationCode?: ValidationCode;
	validationField?: string;
};
