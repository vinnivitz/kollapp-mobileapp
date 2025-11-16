import type { AuthenticatedUserTO, LoginRequestTO, TokenTO } from '@kollapp/api-types';

import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { appStateStore } from '$lib/stores';
import { customFetch } from '$lib/utility';

class AuthenticationResource {
	ENDPOINT = 'public/auth';

	/**
	 * Logs in a user and returns the validation result
	 * @param model login model
	 * @returns {Promise<ResponseBody<AuthenticatedUserTO>>} validation result
	 */
	async login(model: LoginRequestTO): Promise<ResponseBody<AuthenticatedUserTO>> {
		return customFetch(`${this.ENDPOINT}/signin`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST,
			silentOnSuccess: true
		});
	}

	/**
	 * Refreshes the access token
	 * @param token refresh token
	 * @returns {Promise<ResponseBody<TokenTO>>} new access token
	 */
	async refresh(token: string): Promise<ResponseBody<TokenTO>> {
		return customFetch(`${this.ENDPOINT}/refresh`, {
			authorizationType: AuthorizationType.NONE,
			query: { token },
			silentOnSuccess: true
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

export const authenticationResource = new AuthenticationResource();
