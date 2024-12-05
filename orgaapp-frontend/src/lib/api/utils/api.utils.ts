import { Network } from '@capacitor/network';
import { get } from 'svelte/store';

import { PUBLIC_API_URL } from '$env/static/public';
import type { TokenDto } from '$lib/api/dto';
import {
	ContentType,
	RequestMethod,
	type ApiResponse,
	type ServerResponseBody,
	type UserModel
} from '$lib/api/models';
import { t } from '$lib/locales';
import {
	AlertType,
	PreferencesKey,
	type ValidationResult as ValidationResponse
} from '$lib/models';
import { userStore } from '$lib/store';
import { determineLocale, getStoredValue, showAlert, storeValue } from '$lib/utils';

const $t = get(t);

/**
 * Custom fetch function with authentication and error handling.
 * @param url Endpoint URL.
 * @param auth Whether authentication is required.
 * @param options Fetch options.
 * @returns Fetch Response.
 */
export async function customFetch(
	url: string,
	auth = true,
	options: RequestInit = {}
): Promise<Response> {
	try {
		const headers = new Headers(options.headers);

		if (hasRequestBody(options)) {
			headers.set('Content-Type', ContentType.JSON);
		}

		if (auth) {
			const token = await getToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			} else {
				return createUnauthorizedResponse();
			}
		}

		const enhancedUrl = await getEnhancedUrl(url);
		const response = await fetch(enhancedUrl, { ...options, headers });

		if (StatusChecks.isInternalServerError(response.status)) {
			return createErrorResponse(response);
		}

		const networkStatus = await Network.getStatus();
		const isOnline = networkStatus?.connected;
		const wasOnline = await getStoredValue<boolean>(PreferencesKey.ONLINE);

		if (!isOnline && wasOnline) {
			showAlert({ message: $t('api.offline'), type: AlertType.INFO });
			await storeValue(PreferencesKey.ONLINE, false);
			return createErrorResponse(new Error('Device is offline.'));
		}

		if (isOnline && !wasOnline) {
			showAlert({ message: $t('api.online'), type: AlertType.INFO });
			await storeValue(PreferencesKey.ONLINE, true);
		}

		return response;
	} catch (error) {
		return createErrorResponse(error);
	}
}

/**
 * Constructs the full API URL based on the endpoint.
 * @param endpoint Relative endpoint path.
 * @returns Full API URL as a string.
 */
export function getUrl(endpoint: string): string {
	return `${PUBLIC_API_URL}/${endpoint}`;
}

/**
 * Checks if the user is authenticated based on stored tokens.
 * @returns True if authenticated; otherwise, false.
 */
export async function isAuthenticated(): Promise<boolean> {
	const user = get(userStore) || (await getStoredValue<UserModel>(PreferencesKey.USER));
	return Boolean(user);
}

/**
 * Stores access and refresh tokens in the preferences store.
 * @param model Token data transfer object.
 */
export async function storeTokens(model: TokenDto): Promise<void> {
	await Promise.all([
		storeValue(PreferencesKey.ACCESS_TOKEN, model.accessToken),
		storeValue(PreferencesKey.REFRESH_TOKEN, model.refreshToken)
	]);
}

/**
 * Processes the API response, showing alerts as necessary.
 * @param response Fetch response.
 * @param message Default message for alerts.
 * @param silent If true, no alert is shown.
 * @returns ApiResponse containing status, message, and optional data.
 */
export async function getApiResponse<T>(
	response: Response,
	silent = false
): Promise<ApiResponse<T>> {
	let message = '';
	let type = AlertType.INFO;
	if (!response.ok) {
		message = $t('api.error');
		type = AlertType.ERROR;
	}
	const contentType = determineResponseContentType(response);
	switch (contentType) {
		case ContentType.TEXT: {
			message = (await response.text()) ?? message;
			if (!silent && message) {
				showAlert({ message, type });
			}
			return { status: response.status, message };
		}
		case ContentType.JSON: {
			const body = (await response.json()) as ServerResponseBody<T>;
			const message = body.message ?? '';
			if (!silent) {
				showAlert({ message, type });
			}
			return {
				status: response.status,
				message: body.message,
				data: body.data,
				validationField: body.validationField
			};
		}
		default: {
			if (!silent) {
				showAlert({ message, type });
			}
			return { status: response.status, message };
		}
	}
}

/**
 * Processes the validation response, showing alerts as necessary.
 * @param response Fetch response.
 * @param message Default message for alerts.
 * @param silent If true, no alert is shown.
 * @returns ValidationResult indicating validity and any errors.
 */
export async function getValidationResponse(
	response: Response,
	message: string = $t('api.error'),
	silent = false
): Promise<ValidationResponse> {
	if (response.ok) {
		if (message && !silent) {
			showAlert({ message, type: AlertType.INFO });
		}
		return { valid: true };
	}
	return getValidationError(response);
}

/**
 * Processes validation errors by showing alerts as necessary and returning validation response.
 * @param response Fetch response.
 * @returns {Promise<ValidationResult>}
 */
export async function getValidationError(response: Response): Promise<ValidationResponse> {
	try {
		const result = (await response.json()) as ApiResponse;
		const message = result.message || $t('api.error');

		if (result.validationField) {
			return {
				valid: false,
				errors: [{ message, field: result.validationField }]
			};
		}

		showAlert({ message, type: AlertType.ERROR });
		return { valid: false };
	} catch {
		showAlert({ message: $t('api.error'), type: AlertType.ERROR });
		return { valid: false };
	}
}

/**
 * Processes response errors, showing alerts as necessary.
 * @param error error object
 * @param silent if true, no alert is shown
 * @returns {ApiResponse<T>}
 */
export function getResponseError<T>(error: unknown, silent = false): ApiResponse<T> {
	let message = $t('api.error');

	if (error instanceof Error) {
		message = error.message;
	}

	if (!silent) {
		showAlert({ message, type: AlertType.ERROR });
	}

	return { status: 501, message };
}

/**
 * Checks if http status code is in the given range.
 */
export const StatusChecks = {
	isOK: (status: number): boolean => status >= 200 && status < 300,
	isBadRequest: (status: number): boolean => status === 400,
	isUnauthorized: (status: number): boolean => status === 401,
	isInternalServerError: (status: number): boolean => status >= 500 && status < 600
};

function hasRequestBody(options: RequestInit): boolean {
	const method = options.method?.toUpperCase();
	return (
		(method === RequestMethod.POST || method === RequestMethod.PUT) &&
		typeof options.body === 'string'
	);
}

async function getEnhancedUrl(url: string): Promise<string> {
	const locale = await determineLocale();
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}locale=${locale}`;
}

async function getToken(): Promise<string | undefined> {
	return getStoredValue<string>(PreferencesKey.ACCESS_TOKEN);
}

function createUnauthorizedResponse(): Response {
	return new Response(JSON.stringify({ message: 'Unauthorized' }), {
		status: 401,
		statusText: 'Unauthorized',
		headers: { 'Content-Type': ContentType.JSON }
	});
}

async function createErrorResponse(error: unknown): Promise<Response> {
	let message = $t('api.error');

	if (error instanceof Error) {
		message = error.message === 'Failed to fetch' ? message : error.message;
	} else if (error instanceof Response) {
		try {
			const data = await error.json();
			message = data?.message || error.statusText;
		} catch {
			message = error.statusText || 'Unknown error';
		}
	}
	return new Response(JSON.stringify({ message }), {
		status: 501,
		statusText: 'Internal Server Error',
		headers: { 'Content-Type': ContentType.JSON }
	});
}

function determineResponseContentType(response: Response): ContentType | undefined {
	const type = response.headers.get('Content-Type') as ContentType;
	return Object.values(ContentType).includes(type) ? type : undefined;
}
