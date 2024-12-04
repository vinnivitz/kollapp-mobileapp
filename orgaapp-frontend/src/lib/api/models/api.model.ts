export type ResponseModel<T = unknown> = {
	status: number;
	message?: string;
	data?: T;
	validationField?: string;
};

export enum ContentType {
	JSON = 'application/json',
	TEXT = 'text/plain'
}

export enum RequestMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE'
}
