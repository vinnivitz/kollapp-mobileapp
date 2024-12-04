import { get as i18nGet } from 'svelte/store';

import { type ResponseModel, type UserModel } from '$lib/api/models';
import { customFetch, getUrl, handleDefaultResponse, handleResponseError } from '$lib/api/utils';
import { t } from '$lib/locales';

const $t = i18nGet(t);

const ENDPOINT = 'user';

/**
 * Get user data
 * @returns {Promise<ServerResponse<UserModel>>} user data
 */
export async function get(silent?: boolean): Promise<ResponseModel<UserModel>> {
	try {
		const response = await customFetch(getUrl(ENDPOINT));
		return handleDefaultResponse<UserModel>(response, $t('api.user.get-user.message'), silent);
	} catch (error) {
		return handleResponseError<UserModel>(error, silent);
	}
}
