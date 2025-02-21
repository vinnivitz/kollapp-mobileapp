/**
 * Validation code for the response
 */
export enum ValidationCode {
	EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED'
}

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

/**
 * Custom fetch configuration
 */
export type CustomFetchConfig =
	| {
			method?: RequestMethod.GET | RequestMethod.DELETE;
			body?: never;
			query?: Record<string, string>;
			authorizationType?: AuthorizationType;
			silentOnSuccess?: boolean;
			silentOnError?: boolean;
	  }
	| {
			method: RequestMethod.POST | RequestMethod.PUT;
			body: string;
			query?: Record<string, string>;
			authorizationType?: AuthorizationType;
			silentOnSuccess?: boolean;
			silentOnError?: boolean;
	  };
