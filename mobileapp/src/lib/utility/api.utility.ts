import type { AuthenticationModel } from '$lib/models/models';

import { get } from 'svelte/store';

import { dev } from '$app/environment';

import { authResource, errorLogResource } from '$lib/api/resources';
import environment from '$lib/environment';
import { Locale, t } from '$lib/locales';
import {
	AuthorizationType,
	ContentType,
	type CustomFetchConfig,
	HeaderKey,
	RequestMethod,
	type ResponseBody,
	StatusCode,
	UserRole
} from '$lib/models/api';
import { PreferencesKey } from '$lib/models/preferences';
import { AlertType, type ValidationResult } from '$lib/models/ui';
import { authenticationStore, connectionStore, localeStore, userStore } from '$lib/stores';
import { getStoredValue, showAlert } from '$lib/utility';

const $t = get(t);

/**
 * Custom fetch function with authentication and error handling.
 * @param url url string
 * @param config config object
 * @returns {Promise<ResponseBody<T>>}
 */
export async function customFetch<T = never>(url: string, config?: CustomFetchConfig): Promise<ResponseBody<T>> {
	url = getUrl(url);
	const method = config?.method ?? RequestMethod.GET;
	const body = config?.body;
	const query = config?.query;
	const authorizationType = config?.authorizationType ?? AuthorizationType.BEARER;
	const silentOnSuccess = config?.silentOnSuccess ?? false;
	const silentOnError = config?.silentOnError ?? false;

	try {
		const options: RequestInit = { method };
		const headers = new Headers();

		headers.set(HeaderKey.ACCEPT_LANGUAGE, get(localeStore) ?? Locale.DE);

		if (hasRequestBody(method)) {
			headers.set(HeaderKey.CONTENT_TYPE, ContentType.JSON);
			options.body = body;
		}

		if (authorizationType === AuthorizationType.BEARER) {
			const token = get(authenticationStore)?.accessToken;
			if (token) {
				headers.set(HeaderKey.AUTHORIZATION, getBearerToken(token));
			} else {
				return handleAuthenticationError();
			}
		}

		const enhancedUrl = await getEnhancedUrl(url, query);

		let response = await fetch(enhancedUrl, { ...options, headers });

		if (StatusCheck.isUnauthorized(response.status)) {
			const newToken = await getNewAuthenticationToken();
			if (!newToken) {
				return handleAuthenticationError();
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
	const model = get(authenticationStore) || (await getStoredValue<AuthenticationModel>(PreferencesKey.AUTHENTICATION));
	return !!model;
}

/**
 * Processes the validation response, showing alerts as necessary.
 * @param body Fetch response.
 * @returns {ValidationResult} ValidationResult indicating validity and any errors.
 */
export function getValidationResult<T>(body: ResponseBody<T>): ValidationResult {
	return {
		errors: [
			{
				code: body.validationCode,
				field: body.validationField,
				message: body.message ?? $t('api.error')
			}
		],
		valid: StatusCheck.isOK(body.status)
	};
}

/**
 * Checks if http status code is in the given range.
 */
export const StatusCheck = {
	isOK: (status: number): boolean => status >= 200 && status < 300,
	isUnauthorized: (status: number): boolean => status === StatusCode.UNAUTHORIZED
};

/**
 * Checks if the user has the given role.
 * @param role UserRole to check.
 * @returns {boolean} True if the user has the role; otherwise, false.
 */
export function hasRole(role: UserRole): boolean {
	return !!get(userStore)?.roles.includes(role);
}

async function handleAuthenticationError(): Promise<ResponseBody> {
	await authResource.logout();
	return createErrorResponse(StatusCode.UNAUTHORIZED, $t('api.unauthorized'), true);
}

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
		return { data, message, status };
	}
	const body = (await response.json()) as ResponseBody<T>;
	message = body.message ?? (response.ok ? message : $t('api.error'));
	data = body.data ?? data;
	const { validationCode, validationField } = body;
	if (!silent && !validationField) {
		showAlert(message, { type: response.ok ? AlertType.SUCCESS : AlertType.ERROR });
	}
	// only triggered in dev mode
	if (dev) {
		if (response.ok) {
			console.info(message);
		} else {
			console.warn(`status: ${response.status}, msg: ${message}`);
		}
	}
	return {
		data,
		message,
		status,
		validationCode,
		validationField
	};
}

function hasRequestBody(method: RequestMethod): boolean {
	return method === RequestMethod.POST || method === RequestMethod.PUT;
}

async function getEnhancedUrl(url: string, query: Record<string, string> | undefined): Promise<string> {
	const queryParameters = new URLSearchParams(query).toString();
	return queryParameters ? `${url}?${queryParameters}` : url;
}

async function getNewAuthenticationToken(): Promise<string | undefined> {
	const refreshToken = get(authenticationStore)?.refreshToken;
	if (refreshToken) {
		const body = await authResource.refresh(refreshToken);
		if (StatusCheck.isOK(body.status)) {
			const accessToken = body.data.token;
			await authenticationStore.set({ accessToken, refreshToken });
			return accessToken;
		}
	} else {
		await authenticationStore.reset();
	}
}

async function createErrorResponse(status: number, message: string, silent: boolean): Promise<ResponseBody> {
	if (!silent) {
		showAlert(message);
	}
	const log = `status: ${status}, msg: ${message}`;
	if (dev) {
		console.warn(log);
	} else if (!StatusCheck.isUnauthorized(status)) {
		errorLogResource.reportErrorLog(log);
	}
	return { data: {} as never, message, status };
}

function getBearerToken(token: string): string {
	return `Bearer ${token}`;
}
