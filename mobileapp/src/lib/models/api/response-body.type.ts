/**
 * Server response body
 */
export type ResponseBody<T = never> = {
	data: T;
	status: number;
	message?: string;
	validationField?: string;
};
