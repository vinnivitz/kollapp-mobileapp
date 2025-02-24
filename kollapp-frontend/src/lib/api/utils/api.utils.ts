import { get } from 'svelte/store';

import { dev } from '$app/environment';

import { apiResources } from '$lib/api';
import type { UserDto } from '$lib/api/dto/server';
import {
	AuthorizationType,
	ContentType,
	HeaderKey,
	RequestMethod,
	StatusCode,
	type CustomFetchConfig,
	type ResponseBody
} from '$lib/api/models';
import environment from '$lib/environment';
import { t } from '$lib/locales';
import { PreferencesKey } from '$lib/models/preferences';
import { AlertType, type ValidationResult } from '$lib/models/ui';
import { authenticationStore, connectionStore, userStore } from '$lib/store';
import { determineLocale, getStoredValue, showAlert } from '$lib/utils';

const $t = get(t);

/**
 * Custom fetch function with authentication and error handling.
 * @param url url string
 * @param config config object
 * @returns {Promise<ResponseBody<T>>}
 */
export async function customFetch<T = never>(
	url: string,
	config?: CustomFetchConfig
): Promise<ResponseBody<T>> {
	url = getUrl(url);
	const method = config?.method ?? RequestMethod.GET;
	const body = config?.body;
	const query = config?.query;
	const authorizationType = config?.authorizationType ?? AuthorizationType.BEARER;
	const silentOnSuccess = config?.silentOnSuccess ?? true;
	const silentOnError = config?.silentOnError ?? false;

	try {
		const options: RequestInit = { method };
		const headers = new Headers();

		headers.set(HeaderKey.ACCEPT_LANGUAGE, await determineLocale());

		if (hasRequestBody(method)) {
			headers.set(HeaderKey.CONTENT_TYPE, ContentType.JSON);
			options.body = body;
		}

		if (authorizationType === AuthorizationType.BEARER) {
			const token = await getAuthenticationToken();
			if (token) {
				headers.set(HeaderKey.AUTHORIZATION, getBearerToken(token));
			} else {
				return createErrorResponse(StatusCode.UNAUTHORIZED, $t('api.unauthorized'), silentOnError);
			}
		}

		const enhancedUrl = await getEnhancedUrl(url, query);

		let response = await fetch(enhancedUrl, { ...options, headers });

		if (StatusCheck.isUnauthorized(response.status)) {
			const newToken = await getNewAuthenticationToken();
			if (!newToken) {
				return createErrorResponse(StatusCode.UNAUTHORIZED, $t('api.unauthorized'), silentOnError);
			}
			headers.set(HeaderKey.AUTHORIZATION, getBearerToken(newToken));
			response = await fetch(enhancedUrl, { ...options, headers });
		}

		connectionStore.check();

		return getResponseBody(response, silentOnSuccess, silentOnError);
	} catch (error) {
		let message = $t('api.error');
		let status = StatusCode.SERVICE_UNAVAILABLE;
		if (error instanceof Error) {
			message = error.message === 'Failed to fetch' ? $t('api.not-available') : error.message;
		} else if (error instanceof Response) {
			status = error.status;
		}
		return createErrorResponse(status, message, false);
	}
}

/**
 * Checks if the user is authenticated based on stored tokens.
 * @returns {Promise<boolean>} True if authenticated; otherwise, false.
 */
export async function isAuthenticated(): Promise<boolean> {
	const user = get(userStore) || (await getStoredValue<UserDto>(PreferencesKey.USER));
	return !!user;
}

/**
 * Processes the validation response, showing alerts as necessary.
 * @param body Fetch response.
 * @param silent If true, no alert is shown.
 * @returns {ValidationResult} ValidationResult indicating validity and any errors.
 */
export function getValidationResult<T>(body: ResponseBody<T>): ValidationResult {
	return {
		valid: StatusCheck.isOK(body.status),
		errors: [
			{
				message: body.message ?? $t('api.error'),
				field: body.validationField,
				code: body.validationCode
			}
		]
	};
}

/**
 * Checks if http status code is in the given range.
 */
export const StatusCheck = {
	isOK: (status: number): boolean => status >= 200 && status < 300,
	isUnauthorized: (status: number): boolean => status === StatusCode.UNAUTHORIZED
};

function getUrl(endpoint: string): string {
	return `${environment.apiUrl}/${endpoint}`;
}

async function getResponseBody<T>(
	response: Response,
	silentOnSuccess: boolean,
	silentOnError: boolean
): Promise<ResponseBody<T>> {
	const status = response.status;
	let message = $t('api.success');
	let data = {} as T;
	const contentType = response.headers.get(HeaderKey.CONTENT_TYPE);
	const silent = response.ok ? silentOnSuccess : silentOnError;
	if (!contentType?.includes(ContentType.JSON)) {
		message = contentType?.includes(ContentType.TEXT) ? $t('api.error') : await response.text();
		return { status, message, data };
	}
	const body = (await response.json()) as ResponseBody<T>;
	message = body.message ?? (response.ok ? message : $t('api.error'));
	data = body.data ?? data;
	const validationField = body.validationField;
	const validationCode = body.validationCode;
	if (!silent && !validationField) {
		showAlert({ message, type: response.ok ? AlertType.INFO : AlertType.ERROR });
	}
	// only triggered in dev mode
	if (dev) {
		if (response.ok) {
			console.info(message);
		} else {
			console.error(`status: ${response.status}, msg: ${message}`);
		}
	}
	return {
		status,
		message,
		data,
		validationField,
		validationCode
	};
}

function hasRequestBody(method: RequestMethod): boolean {
	return method === RequestMethod.POST || method === RequestMethod.PUT;
}

async function getEnhancedUrl(
	url: string,
	query: Record<string, string> | undefined
): Promise<string> {
	const queryParameters = new URLSearchParams(query).toString();
	return queryParameters ? `${url}?${queryParameters}` : url;
}

async function getAuthenticationToken(): Promise<string | undefined> {
	const token = get(authenticationStore)?.accessToken;
	return token ?? (await getNewAuthenticationToken());
}

async function getNewAuthenticationToken(): Promise<string | undefined> {
	const refreshToken = get(authenticationStore)?.refreshToken;
	if (!refreshToken) {
		return;
	}
	const body = await apiResources.auth.refresh(refreshToken);
	if (StatusCheck.isOK(body.status)) {
		const accessToken = body.data.token;
		authenticationStore.set({ accessToken, refreshToken });
		return refreshToken;
	}
}

async function createErrorResponse(
	status: number,
	message: string,
	silent: boolean
): Promise<ResponseBody> {
	if (!silent) {
		showAlert({ message, type: AlertType.ERROR });
	}
	if (dev) {
		console.error(`status: ${status}, msg: ${message}`);
	}
	return { status, message, data: {} as never };
}

function getBearerToken(token: string): string {
	return `Bearer ${token}`;
}
