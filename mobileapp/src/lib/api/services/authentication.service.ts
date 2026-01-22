import type { AccessTokenTO, AuthTokensTO, LoginRequestTO } from '@kollapp/api-types';

import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { appStateStore } from '$lib/stores';
import { customFetch } from '$lib/utility';

class AuthenticationService {
	ENDPOINT = 'public/auth';

	/**
	 * Logs in a user and returns the validation result
	 * @param model login model
	 * @returns {Promise<ResponseBody<AuthTokensTO>>} authentication tokens
	 */
	async login(model: LoginRequestTO): Promise<ResponseBody<AuthTokensTO>> {
		return customFetch(`${this.ENDPOINT}/signin`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Refreshes the access token
	 * @param token refresh token
	 * @returns {Promise<ResponseBody<AccessTokenTO>>} new access token
	 */
	async refresh(token: string): Promise<ResponseBody<AccessTokenTO>> {
		return customFetch(`${this.ENDPOINT}/refresh`, {
			authorizationType: AuthorizationType.NONE,
			query: { token }
		});
	}

	/**
	 * Logs out the user by clearing authentication tokens and user information
	 */
	async logout(): Promise<void> {
		await appStateStore.reset();
		await goto(resolve('/auth/login'));
	}
}

export const authenticationService = new AuthenticationService();
