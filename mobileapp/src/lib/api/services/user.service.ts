import type {
	DeleteAccountRequestTO,
	KollappUserTO,
	KollappUserUpdateRequestTO,
	PasswordChangeRequestTO
} from '@kollapp/api-types';

import { get } from 'svelte/store';

import { authenticationService } from './authentication.service';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { userStore } from '$lib/stores';
import {
	customFetch,
	isBiometricAvailable,
	isBiometricEnabled,
	StatusCheck,
	updatePasswordBiometricCredentials
} from '$lib/utility';

class UserService {
	private get base(): string {
		return 'user';
	}

	/** Gets the data of authenticated user
	 * @returns {Promise<ResponseBody<KollappUserTO>>} response body
	 */
	get = async (): Promise<ResponseBody<KollappUserTO>> => {
		return customFetch<KollappUserTO>(this.base, { silentOnSuccess: true });
	};

	/** Changes the password of the authenticated user
	 * @param model password change model
	 * @returns {Promise<ResponseBody>} response body
	 */
	changePassword = async (model: PasswordChangeRequestTO): Promise<ResponseBody> => {
		const response = await customFetch(`${this.base}/change-password`, {
			body: model,
			method: RequestMethod.PATCH
		});
		if (StatusCheck.isOK(response.status) && (await isBiometricAvailable()) && (await isBiometricEnabled())) {
			await updatePasswordBiometricCredentials(model.newPassword);
		}
		return response;
	};

	/** Updates the data of the authenticated user
	 * @param model user update model
	 * @returns {Promise<ResponseBody<KollapreturnpUserTO>>} response body
	 */
	update = async (model: KollappUserUpdateRequestTO): Promise<ResponseBody<KollappUserTO>> => {
		const response = await customFetch<KollappUserTO>(`${this.base}/update-information`, {
			body: model,
			method: RequestMethod.PATCH
		});
		if (StatusCheck.isOK(response.status)) {
			const user = get(userStore);
			if (user?.username === model.username) {
				userStore.set(response.data);
			} else {
				await authenticationService.logout();
			}
		}
		return response;
	};

	/** Deletes the account of the authenticated user
	 * @returns {Promise<ResponseBody>} response body
	 */
	remove = async (model: DeleteAccountRequestTO): Promise<ResponseBody> => {
		return customFetch(`${this.base}`, {
			body: model,
			method: RequestMethod.DELETE
		});
	};
}

export const userService = new UserService();
