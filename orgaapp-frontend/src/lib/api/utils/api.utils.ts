import { Network } from '@capacitor/network';
import { get } from 'svelte/store';

import { PUBLIC_API_URL } from '$env/static/public';
import type { TokenDto } from '$lib/api/dto';
import {
	AuthorizationType,
	ContentType,
	RequestMethod,
	StatusCode,
	type CustomFetchConfig,
	type ResponseBody,
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
import {
	determineLocale,
	getStoredValue,
	removeStoredValue,
	showAlert,
	storeValue
} from '$lib/utils';
import { apiResources } from '$lib/api';

const $t = get(t);

/**
 * Custom fetch function with authentication and error handling.
 * @param url Endpoint URL.
 * @param options Fetch options.
 * @param authorizationType Authorization type.
 * @param silent If true, no alert is shown.
 * @returns {Promise<ResponseBody<T>>}
 */
export async function customFetch<T = never>(config: CustomFetchConfig): Promise<ResponseBody<T>> {
	let {
		url,
		options = { method: RequestMethod.GET },
		authorizationType = AuthorizationType.BEARER,
		silent = false
	} = config;
	
	try {
		const headers = new Headers(options.headers);

		if (hasRequestBody(options)) {
			headers.set('Content-Type', ContentType.JSON);
		}

		if (authorizationType === AuthorizationType.BEARER) {
			const token = await getToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			} else {
				return createErrorResponse(StatusCode.UNAUTHORIZED, $t('api.error'), silent);
			}
		}

		const enhancedUrl = await getEnhancedUrl(url);
		const response = await fetch(enhancedUrl, { ...options, headers });

		const networkStatus = await Network.getStatus();
		const isOnline = networkStatus?.connected;
		const wasOnline = await getStoredValue<boolean>(PreferencesKey.ONLINE);

		if (!isOnline && wasOnline) {
			await storeValue(PreferencesKey.ONLINE, false);
			showAlert({ message: $t('api.offline'), type: AlertType.ERROR });
		} else if (isOnline && !wasOnline) {
			await storeValue(PreferencesKey.ONLINE, true);
			showAlert({ message: $t('api.online'), type: AlertType.INFO });
		}

		return getResponseBody(response, silent);
	} catch (error) {
		let message = $t('api.error');
		if (error instanceof Error) {
			message = error.message === 'Failed to fetch' ? message : error.message;
		}
		return createErrorResponse(StatusCode.SERVICE_UNAVAILABLE, message, silent);
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
 * Processes the validation response, showing alerts as necessary.
 * @param body Fetch response.
 * @param silent If true, no alert is shown.
 * @returns ValidationResult indicating validity and any errors.
 */
export function getValidationResult<T>(body: ResponseBody<T>): ValidationResponse {
	return {
		valid: StatusChecks.isOK(body.status),
		errors: [{ message: body.message ?? $t('api.error'), field: body.validationField }]
	};
}

/**
 * Processes response failures (where no response with satus code is returned), showing alerts as necessary.
 * @param error error object
 * @param silent if true, no alert is shown
 * @returns {ApiResponse<T>}
 */
export function handleResponseFailure<T>(error: unknown, silent = false): ResponseBody<T> {
	let message = $t('api.error');

	if (error instanceof Error) {
		message = error.message;
	}

	if (!silent) {
		showAlert({ message, type: AlertType.ERROR });
	}

	return { status: 501, message } as ResponseBody<T>;
}

/**
 * Checks if http status code is in the given range.
 */
export const StatusChecks = {
	isOK: (status: number): boolean => status >= 200 && status < 300,
	isUnauthorized: (status: number): boolean => status === StatusCode.UNAUTHORIZED
};

async function getResponseBody<T>(response: Response, silent: boolean): Promise<ResponseBody<T>> {
	const message = $t('api.error');
	if (response.headers.get('Content-Type') !== ContentType.JSON) {
		return { status: response.status, message, data: {} as T };
	}
	const body = (await response.json()) as ServerResponseBody<T>;
	if (!response.status && !silent) {
		showAlert({ message: body.message ?? message, type: AlertType.ERROR });
	}
	return {
		status: response.status,
		message: body.message,
		data: body.data ?? ({} as T),
		validationField: body.validationField
	};
}

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
	const token = getStoredValue<string>(PreferencesKey.ACCESS_TOKEN);
	return token || getNewToken();
}

async function getNewToken(): Promise<string | undefined> {
	let token = await getStoredValue(PreferencesKey.REFRESH_TOKEN);
	if (!token) {
		return undefined;
	}
	const body = await apiResources.auth.refresh(token);
	if (StatusChecks.isOK(body.status)) {
		token = body.data.refreshToken;
		await storeValue(PreferencesKey.ACCESS_TOKEN, token);
		return token;
	}
	return undefined;
}

async function createErrorResponse(
	status: number,
	message: string = $t('api.error'),
	silent: boolean
): Promise<ResponseBody> {
	if (!silent) {
		showAlert({ message, type: AlertType.ERROR });
	}
	return { status, message, data: {} as never };
}
