import type { ValidationCode } from '$lib/models/api';

/**
 * Server response body
 */
export type ResponseBody<T = never> = {
	data: T;
	status: number;
	message?: string;
	validationCode?: ValidationCode;
	validationField?: string;
};
