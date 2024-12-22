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
export type ResponseBody<T = never> = {
	status: number;
	message?: string;
	data: T;
	validationField?: string;
};

export type ServerResponseBody<T = undefined> = {
	message?: string;
	data?: T;
	validationField?: string;
};

/**
 * Authorization type for the request
 */
export enum AuthorizationType {
	BEARER,
	NONE
}

/**
 * Http status codes
 */
export enum StatusCode {
	OK = 200,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	INTERNAL_SERVER_ERROR = 500,
	SERVICE_UNAVAILABLE = 503
}


export type CustomFetchConfig = {
	url: string;
	options?: RequestInit;
	authorizationType?: AuthorizationType;
	silent?: boolean;
} 