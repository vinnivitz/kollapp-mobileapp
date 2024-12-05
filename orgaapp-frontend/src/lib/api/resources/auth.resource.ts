import { get } from 'svelte/store';

import type { LoginDto, RegisterDto, TokenDto } from '$lib/api/dto';
import { RequestMethod } from '$lib/api/models';
import {
	customFetch,
	getUrl,
	getResponseError,
	getValidationError,
	getValidationResponse,
	storeTokens
} from '$lib/api/utils';
import { t } from '$lib/locales';
import type { ValidationResult } from '$lib/models';
import { userStore } from '$lib/store';
import type { EmailDto } from '../dto/email.dto';

const $t = get(t);

const ENDPOINT = 'auth';

/**
 * Registers a new user and returns the validation result
 * @param model registration model
 * @returns {Promise<ValidationResult>} validation result
 */
export async function register(model: RegisterDto): Promise<ValidationResult> {
	try {
		const response = await customFetch(getUrl(`${ENDPOINT}/register`), false, {
			method: RequestMethod.POST,
			body: JSON.stringify(model)
		});
		return getValidationResponse(response, $t('api.auth.register.message'));
	} catch (error) {
		console.log('error', error);
		getResponseError(error);
		return { valid: false };
	}
}

/**
 * Logs in a user and returns the validation result
 * @param model login model
 * @returns {Promise<ValidationResult>} validation result
 */
export async function login(model: LoginDto): Promise<ValidationResult> {
	try {
		const response = await customFetch(getUrl(`${ENDPOINT}/login`), false, {
			method: RequestMethod.POST,
			body: JSON.stringify(model)
		});
		if (response.ok) {
			const result = (await response.json()) as TokenDto;
			await storeTokens(result);
			await userStore.init();
			return { valid: true };
		} else {
			return getValidationError(response);
		}
	} catch (error) {
		console.log('error', error);
		getResponseError(error);
		return { valid: false };
	}
}

/**
 * Requests an email to reset the password
 * @param model email model
 * @returns {Promise<ValidationResult>}
 */
export async function requestPasswordReset(model: EmailDto): Promise<ValidationResult> {
	try {
		const response = await customFetch(getUrl(`${ENDPOINT}/reset-password`), false, {
			method: RequestMethod.POST,
			body: JSON.stringify(model)
		});
		return getValidationResponse(response);
	} catch (error) {
		console.log('error', error);
		getResponseError(error);
		return { valid: false };
	}
}
