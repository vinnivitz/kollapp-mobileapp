import { get } from 'svelte/store';

import { PUBLIC_API_URL } from '$env/static/public';
import type { TokenDto } from '$lib/api/dto';
import type { UserModel } from '$lib/api/models';
import { ContentType, type ResponseModel as ApiResponse } from '$lib/api/models';
import { t } from '$lib/locales';
import {
	AlertType,
	PreferencesKey,
	type ValidationResult as ValidationResponse
} from '$lib/models';
import { alertStore, userStore } from '$lib/store';
import { determineLocale, getStoredValue, storeValue } from '$lib/utils';

const $t = get(t);

/**
 * Get api url based on `endpoint` and environment
 * @param endpoint relative endpoint
 * @returns {string} server url
 */
export function getUrl(endpoint: string): string {
	return `${PUBLIC_API_URL}/${endpoint}`;
}

/**
 * Custom fetch function with authentication and error handling
 * @param url url
 * @param auth authentication required
 * @param options fetch options
 * @returns {Promise<Response>} fetch response
 */
export async function customFetch(
	url: string,
	auth = true,
	options: RequestInit = {}
): Promise<Response> {
	try {
		if (hasRequestBody(options)) {
			options.headers = {
				...options.headers,
				'Content-Type': ContentType.JSON
			};
		}
		if (auth) {
			const token = await getToken();
			if (token) {
				options.headers = {
					...options.headers,
					Authorization: `Bearer ${token}`
				};
			} else {
				return unauthorizedResponse();
			}
		}

		url = await getEnhancedUrl(url);
		const response = await fetch(url, options);

		if (isInternalServerErrorStatus(response.status)) {
			return handleError(response);
		}

		if (navigator && !navigator.onLine) {
			alertStore.set({ message: $t('api.offline'), type: AlertType.INFO });
			await storeValue(PreferencesKey.ONLINE, false);
			return handleError(new Error('Device is offline.'));
		}

		if ((await getStoredValue<boolean>(PreferencesKey.ONLINE)) === false) {
			alertStore.set({ message: $t('api.online'), type: AlertType.INFO });
			await storeValue(PreferencesKey.ONLINE, true);
		}
		return response;
	} catch (error) {
		return handleError(error);
	}
}

/**
 * Returns `true` if user is authenticated based on stored tokens otherwise `false`
 * @returns {Promise<void>}
 */
export async function isAuthenticated(): Promise<boolean> {
	return !!(get(userStore) || (await getStoredValue<UserModel>(PreferencesKey.USER)));
}

/**
 * Store `accessToken` and `refreshToken` to preferences store
 * @param model token model
 */
export async function storeTokens(model: TokenDto): Promise<void> {
	await storeValue(PreferencesKey.ACCESS_TOKEN, model.accessToken);
	await storeValue(PreferencesKey.REFRESH_TOKEN, model.refreshToken);
}

/**
 * Handle fetch error
 * @param error error object
 * @returns {Promise<Response>} fetch response
 */
async function handleError(error: unknown): Promise<Response> {
	let message = $t('api.error');

	if (error instanceof Error) {
		message = error.message;
	} else if (error instanceof Response) {
		const data = await error.json();
		message = data?.message || error.statusText;
	}
	return new Response(JSON.stringify({ message }), {
		status: 503,
		statusText: 'Service Unavailable',
		headers: { 'Content-Type': ContentType.JSON }
	});
}

/**
 * Get language enhanced URL
 * @param url url
 * @returns {Promise<string>} language enhanced URL
 */
async function getEnhancedUrl(url: string): Promise<string> {
	const locale = await determineLocale();
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}locale=${locale}`;
}

/**
 * Get access token from storage or new token if not available
 * @returns {Promise<string | null>} access token
 */
async function getToken(): Promise<string | undefined> {
	return await getStoredValue<string>(PreferencesKey.ACCESS_TOKEN);
}

/**
 * Check if request has a request body
 * @param options fetch options
 * @returns {boolean} is standard POST or PUT request
 */
function hasRequestBody(options: RequestInit): boolean {
	return (
		(options.method === 'POST' || options.method === 'PUT') && typeof options.body === 'string'
	);
}

/**
 * Creates an unauthorized response and returns it
 * @returns {Response} unauthorized response
 */
function unauthorizedResponse(): Response {
	return new Response(JSON.stringify({ statusCode: 401, message: 'Unauthorized' }), {
		status: 401,
		statusText: 'Unauthorized',
		headers: { 'Content-Type': ContentType.JSON }
	});
}

/**
 * Handle fetch response by showing alert and returning server response
 * @param response fetch response
 * @param message alert message
 * @param silent if true, do not show alert
 * @returns {Promise<ApiResponse>} server response
 */
export async function handleDefaultResponse<T>(
	response: Response,
	message?: string,
	silent?: boolean
): Promise<ApiResponse<T>> {
	if (response.ok) {
		if (message && !silent) {
			alertStore.set({ message, type: AlertType.INFO });
		}
		return getApiResponse<T>(response);
	} else {
		return handleNotOkResponse<T>(response, silent);
	}
}

/**
 * Handle validation response by showing alert and returning validation result
 * @param response fetch response
 * @param message alert message
 * @param silent if true, do not show alert
 * @returns {Promise<ValidationResponse>} validation result
 */
export async function handleValidationResponse(
	response: Response,
	message: string,
	silent?: boolean
): Promise<ValidationResponse> {
	if (response.ok) {
		if (message && !silent) {
			alertStore.set({ message, type: AlertType.INFO });
		}
		return { valid: true };
	} else {
		return handleValidationError(response);
	}
}

/**
 * Handle not OK response by showing alert and returning server response
 * @param response fetch response
 * @param silent if true, do not show alert
 * @returns {Promise<ApiResponse>} server response
 */
export async function handleNotOkResponse<T>(
	response: Response,
	silent?: boolean
): Promise<ApiResponse<T>> {
	const result = (await response.json()) as ApiResponse<T>;
	if (!silent) {
		alertStore.set({ message: result.message ?? $t('api.error'), type: AlertType.ERROR });
	}
	return result;
}

/**
 * Handle validation error by showing alert and returning validation result
 * @param response fetch response
 * @returns {Promise<ValidationResponse>} validation result
 */
export async function handleValidationError(response: Response): Promise<ValidationResponse> {
	const result = (await response.json()) as ApiResponse;
	const message = result.message ?? $t('api.error');
	if (result.validationField) {
		return {
			valid: false,
			errors: [{ message, field: result.validationField }]
		};
	} else {
		alertStore.set({ message, type: AlertType.ERROR });
		return { valid: false };
	}
}

/**
 * Handle response error by showing alert and returning server response
 * @param error error object
 * @param silent if true, do not show alert
 * @returns {ApiResponse} server response
 */
export function handleResponseError<T>(error: unknown, silent = false): ApiResponse<T> {
	let message = $t('api.error');
	if (error instanceof Error) {
		message = error.message;
	}
	if (!silent) {
		alertStore.set({ message, type: AlertType.ERROR });
	}
	return { status: 501, message };
}

/**
 * Get api response based on content type
 * @param response fetch response
 * @param defaultMessage default message
 * @returns {Promise<ApiResponse>} server response
 */
export async function getApiResponse<T>(
	response: Response,
	defaultMessage?: string
): Promise<ApiResponse<T>> {
	let message;
	switch (determineResponseContentType(response)) {
		case ContentType.JSON: {
			message = await response.json();
			break;
		}
		case ContentType.TEXT: {
			message = await response.text();
			break;
		}
		default: {
			message = defaultMessage ?? '';
			break;
		}
	}
	return { status: response.status, message };
}

/**
 * Check if status code is OK
 * @param status status code
 * @returns {boolean} is OK status
 */
export function isOKStatus(status: number): boolean {
	return status >= 200 && status < 300;
}

/**
 * Check if status code is bad request
 * @param status status code
 * @returns {boolean} is bad request status
 */
export function isBadRequestStatus(status: number): boolean {
	return status === 400;
}

/**
 * Check if status code is unauthorized
 * @param status status code
 * @returns {boolean} is unauthorized status
 */
export function isUnauthorizedStatus(status: number): boolean {
	return status === 401;
}

/**
 * Check if status code is internal server error
 * @param status status code
 * @returns {boolean} is internal server error status
 */
export function isInternalServerErrorStatus(status: number): boolean {
	return status === 500;
}

function determineResponseContentType(response: Response): ContentType | undefined {
	const type = response.headers.get('Content-Type') as ContentType;
	return Object.values(ContentType).includes(type) ? type : undefined;
}
