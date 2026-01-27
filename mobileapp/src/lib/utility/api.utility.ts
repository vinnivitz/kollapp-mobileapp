import type { AuthTokensTO, OrganizationRole, SystemRoleTO } from '@kollapp/api-types';

import { get } from 'svelte/store';

import { dev } from '$app/environment';

import { authenticationService } from '$lib/api/services';
import environment from '$lib/environment';
import { Locale, t } from '$lib/locales';
import {
	AuthorizationType,
	ContentType,
	type CustomFetchConfig,
	HeaderKey,
	RequestMethod,
	type ResponseBody,
	StatusCode
} from '$lib/models/api';
import { StorageKey, StorageStrategy } from '$lib/models/storage';
import { AlertType, type ValidationResult } from '$lib/models/ui';
import {
	appStateStore,
	authenticationStore,
	connectionStore,
	localeStore,
	organizationStore,
	userStore
} from '$lib/stores';
import { getStoredValue, showAlert } from '$lib/utility';

let refreshPromise: Promise<string | undefined> | undefined;

/**
 * Custom fetch function with authentication and error handling.
 * @param url url string
 * @param config config object
 * @returns {Promise<ResponseBody<T>>}
 */
export async function customFetch<T = never>(url: string, config?: CustomFetchConfig): Promise<ResponseBody<T>> {
	const $t = get(t);
	url = getUrl(url);

	const {
		authorizationType = AuthorizationType.BEARER,
		body,
		method = RequestMethod.GET,
		query,
		silentOnError = false,
		silentOnSuccess = true
	} = config ?? {};

	function buildHeaders(): Headers {
		const headers = new Headers();
		headers.set(HeaderKey.ACCEPT_LANGUAGE, get(localeStore) ?? Locale.DE);
		if (body) {
			headers.set(HeaderKey.CONTENT_TYPE, ContentType.JSON);
		}
		return headers;
	}

	function buildOptions(headers: Headers): RequestInit {
		const options: RequestInit = { headers, method };
		if (body) {
			options.body = typeof body === 'string' ? body : JSON.stringify(body);
		}
		return options;
	}

	async function handleUnauthorizedResponse(
		response: Response,
		enhancedUrl: string,
		headers: Headers
	): Promise<Response | undefined> {
		if (!StatusCheck.isUnauthorized(response.status)) return response;
		const newToken = await getNewAuthenticationToken();
		if (!newToken) return undefined;
		headers.set(HeaderKey.AUTHORIZATION, getBearerToken(newToken));
		response = await fetch(enhancedUrl, buildOptions(headers));
		if (StatusCheck.isUnauthorized(response.status)) return undefined;
		return response;
	}

	try {
		const headers = buildHeaders();

		if (authorizationType === AuthorizationType.BEARER) {
			const token = get(authenticationStore)?.accessToken;
			if (!token) {
				return handleAuthorizationError();
			}
			headers.set(HeaderKey.AUTHORIZATION, getBearerToken(token));
		}

		const enhancedUrl = await getEnhancedUrl(url, query);
		let response = await fetch(enhancedUrl, buildOptions(headers));

		const handled = await handleUnauthorizedResponse(response, enhancedUrl, headers);
		if (!handled) {
			return handleAuthorizationError();
		}
		response = handled;

		connectionStore.check();

		return getResponseBody<T>(response, silentOnSuccess, silentOnError, config?.silentOnStatus);
	} catch (error) {
		let message = $t('utility.api.error.generic');
		let status = StatusCode.SERVICE_UNAVAILABLE;
		if (error instanceof Error) {
			message = error.message === 'Failed to fetch' ? $t('utility.api.server-not-reachable') : error.message;
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
	const model =
		get(authenticationStore) || (await getStoredValue<AuthTokensTO>(StorageKey.AUTHENTICATION, StorageStrategy.SECURE));
	return !!model?.accessToken;
}

/**
 * Processes the validation response, showing alerts as necessary.
 * @param body Fetch response.
 * @returns {ValidationResult<T>} Validation result containing errors and validity status.
 */
export function getValidationResult<T, R>(body: ResponseBody<R>): ValidationResult<T> {
	const $t = get(t);
	return {
		errors: [
			{
				field: body.validationField as keyof T,
				message: body.message ?? $t('utility.api.error.generic')
			}
		],
		valid: StatusCheck.isOK(body.status)
	};
}

/**
 * Checks if http status code is in the given range.
 */
export const StatusCheck = {
	isForbidden: (status: number): boolean => status === StatusCode.FORBIDDEN,
	isOK: (status: number): boolean => status >= 200 && status < 300,
	isUnauthorized: (status: number): boolean => status === StatusCode.UNAUTHORIZED,
	serverNotReachable: (status: number): boolean => status === StatusCode.SERVICE_UNAVAILABLE
};

/**
 * Checks if the user has the given organization role.
 * @param role OrganizationRole to check.
 * @returns {boolean} True if the user has the role; otherwise, false.
 */
export function hasOrganizationRole(role: OrganizationRole): boolean {
	const userId = get(userStore)?.id;
	return !!get(organizationStore)?.personsOfOrganization.find(
		(personOfOrganization) => personOfOrganization.userId === userId && personOfOrganization.organizationRole === role
	);
}

/**
 * Checks if the user has the given system role.
 * @param role SystemRole to check.
 * @returns {boolean} True if the user has the role; otherwise, false.
 */
export function hasSystemRole(role: SystemRoleTO): boolean {
	return get(userStore)?.role === role;
}

/**
 * Gets the person of organization ID for the current user.
 * @returns {number | undefined} Person of organization ID or undefined if not found.
 */
export function getPersonOfOrganizationId(): number | undefined {
	const userId = get(userStore)?.id;
	return get(organizationStore)?.personsOfOrganization.find(
		(personOfOrganization) => personOfOrganization.userId === userId
	)?.id;
}

/**
 * Gets the username for a given person of organization ID.
 * @param personOfOrganizationId Person of organization ID.
 * @returns {string | undefined} Username or undefined if not found.
 */
export function getUsernameByPersonOfOrganizationId(personOfOrganizationId: number): string | undefined {
	return get(organizationStore)?.personsOfOrganization.find(
		(personOfOrganization) => personOfOrganization.id === personOfOrganizationId
	)?.username;
}

/** Gets the budget category name by its ID.
 * @param categoryId Budget category ID.
 * @returns {string} Budget category name or empty string if not found.
 */
export function getBudgetCategoryNameById(categoryId: number): string {
	return get(organizationStore)?.budgetCategories.find((category) => category.id === categoryId)?.name ?? '';
}

/** Gets the current organization ID.
 * @returns {number | undefined} Organization ID or undefined if not set.
 */
export function getOrganizationId(): number | undefined {
	return get(organizationStore)?.id;
}

/**
 * Gets the current organization name.
 * @returns {string | undefined} Organization name or undefined if not set.
 */
export function getOrganizationName(): string | undefined {
	return get(organizationStore)?.name;
}

/** Gets the current user ID.
 * @returns {number | undefined} User ID or undefined if not set.
 */
export function getUserId(): number | undefined {
	return get(userStore)?.id;
}

export async function refreshDataStores(): Promise<void> {
	await Promise.all([organizationStore.initialize(), userStore.initialize()]);
}

async function handleAuthorizationError(): Promise<ResponseBody> {
	const $t = get(t);
	await authenticationService.logout();
	return createErrorResponse(StatusCode.UNAUTHORIZED, $t('utility.api.error.authorization'), true);
}

function getUrl(endpoint: string): string {
	return `${environment.apiUrl}/${endpoint}`;
}

async function getResponseBody<T>(
	response: Response,
	silentOnSuccess: boolean,
	silentOnError: boolean,
	silentOnSpecificStatus?: StatusCode[]
): Promise<ResponseBody<T>> {
	const $t = get(t);
	const status = response.status;
	let message = $t('utility.api.request-successful');
	let data = {} as T;
	const contentType = response.headers.get(HeaderKey.CONTENT_TYPE);
	const silent = response.ok ? silentOnSuccess : silentOnError;
	if (!contentType?.includes(ContentType.JSON)) {
		message = contentType?.includes(ContentType.TEXT) ? $t('utility.api.error.generic') : await response.text();
		return { data, message, status };
	}
	const body = (await response.json()) as ResponseBody<T>;
	message = body.message ?? (response.ok ? message : $t('utility.api.error.generic'));
	data = body.data ?? data;
	const { validationField } = body;
	if (!silent && !validationField && !silentOnSpecificStatus?.includes(status)) {
		await showAlert(message, { type: response.ok ? AlertType.SUCCESS : AlertType.ERROR });
	}
	if (dev) {
		if (response.ok) {
			console.info(message);
		} else {
			console.warn(`status: ${response.status}, message: ${message}`);
		}
	}
	return {
		data,
		message,
		status,
		validationField
	};
}

async function getEnhancedUrl(url: string, query: Record<string, string> | undefined): Promise<string> {
	const queryParameters = new URLSearchParams(query).toString();
	return queryParameters ? `${url}?${queryParameters}` : url;
}

async function getNewAuthenticationToken(): Promise<string | undefined> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		const refreshToken = get(authenticationStore)?.refreshToken;
		if (!refreshToken) {
			await appStateStore.reset();
			return;
		}

		const body = await authenticationService.refresh(refreshToken);
		if (StatusCheck.isOK(body.status)) {
			return body.data.token;
		}

		await appStateStore.reset();
	})();

	const result = await refreshPromise;
	refreshPromise = undefined;
	return result;
}

async function createErrorResponse(status: number, message: string, silent: boolean): Promise<ResponseBody> {
	if (!silent) {
		await showAlert(message);
	}
	const log = `status: ${status}, message: ${message}`;
	if (dev) {
		console.warn(log);
	}
	return { data: {} as never, message, status };
}

function getBearerToken(token: string): string {
	return `Bearer ${token}`;
}
