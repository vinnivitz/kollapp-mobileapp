/**
 * Server response body
 */
export type ResponseBody<T = never> = {
	data: T;
	message: string;
	status: number;
	validationField?: string;
};
