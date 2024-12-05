/**
 * Api response model for the application
 */
export type ApiResponse<T = unknown> = {
	status: number;
	message?: string;
	data?: T;
	validationField?: string;
};

/**
 * Content type for the request and response
 */
export enum ContentType {
	JSON = 'application/json',
	TEXT = 'text/plain'
}

/**
 * Request method for the api
 */
export enum RequestMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE'
}

/**
 * Server response body
 */
export type ServerResponseBody<T = string> = {
	message?: string;
	data?: T;
	validationField?: string;
};
