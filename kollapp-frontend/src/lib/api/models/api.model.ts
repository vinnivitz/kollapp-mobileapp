import type { ValidationCode } from './validation.model';

/**
 * Content type for the request and response
 */
export enum ContentType {
	JSON = 'application/json',
	TEXT = 'text/plain'
}

/**
 * Header key for the request
 */
export enum HeaderKey {
	CONTENT_TYPE = 'Content-Type',
	AUTHORIZATION = 'Authorization',
	ACCEPT_LANGUAGE = 'Accept-Language'
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
	validationCode?: ValidationCode;
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
	query?: Record<string, string>;
	method?: RequestMethod;
	body?: string;
	authorizationType?: AuthorizationType;
	silentOnSuccess?: boolean;
	silentOnError?: boolean;
};
