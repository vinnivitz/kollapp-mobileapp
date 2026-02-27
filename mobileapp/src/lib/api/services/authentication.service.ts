import type { PasswordTO } from '$lib/api/dtos';
import type { AccessTokenTO, AuthTokensTO, LoginRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { StorageKey } from '$lib/models/storage';
import { appStateStore, authenticationStore, userStore } from '$lib/stores';
import {
	customFetch,
	isBiometricAvailable,
	isBiometricEnabled,
	StatusCheck,
	storeBiometricCredentials,
	storeValue,
	verifyBiometricIdentity
} from '$lib/utility';

class AuthenticationService {
	private get base(): string {
		return 'public/auth';
	}

	/**
	 * Logs in a user and returns the validation result
	 * @param model login model
	 * @returns {Promise<ResponseBody<AuthTokensTO>>} authentication tokens
	 */
	login = async (model: LoginRequestTO): Promise<ResponseBody<AuthTokensTO>> => {
		const response = await customFetch<AuthTokensTO>(`${this.base}/signin`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST,
			offlineQueueable: false
		});
		if (StatusCheck.isOK(response.status)) {
			await authenticationStore.set(response.data);
			await appStateStore.initializeBaseData();
			if (!dev && (await isBiometricAvailable()) && !(await isBiometricEnabled())) {
				const verified = await verifyBiometricIdentity();
				if (verified) {
					await Promise.all([
						storeValue(StorageKey.BIOMETRICS_ENABLED, true),
						storeBiometricCredentials(model.username, model.password)
					]);
				}
			}
		}
		return response;
	};

	/**
	 * Verifies the user's password
	 * @param model password model
	 * @returns {Promise<ResponseBody>} response body
	 */
	verifyPassword = async (model: PasswordTO): Promise<ResponseBody> => {
		return customFetch(`${this.base}/signin`, {
			authorizationType: AuthorizationType.NONE,
			body: { password: model.password, username: get(userStore)?.username! } satisfies LoginRequestTO,
			method: RequestMethod.POST,
			offlineQueueable: false
		});
	};

	/**
	 * Refreshes the access token
	 * @param token refresh token
	 * @returns {Promise<ResponseBody<AccessTokenTO>>} new access token
	 */
	refresh = async (token: string): Promise<ResponseBody<AccessTokenTO>> => {
		const response = await customFetch<AccessTokenTO>(`${this.base}/refresh`, {
			authorizationType: AuthorizationType.NONE,
			offlineQueueable: false,
			query: { token }
		});
		if (StatusCheck.isOK(response.status)) {
			await authenticationStore.set({ accessToken: response.data.token, refreshToken: token });
		}
		return response;
	};

	/**
	 * Logs out the user by clearing authentication tokens and user information
	 */
	logout = async (): Promise<void> => {
		await appStateStore.reset();
		await goto(resolve('/auth/login'));
	};
}

export const authenticationService = new AuthenticationService();
