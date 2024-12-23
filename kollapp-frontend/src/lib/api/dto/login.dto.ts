import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Login DTO for organization login.
 */
export type LoginDto = {
	username: string;
	password: string;
};

/**
 * Login schema for organization login.
 * @returns {ObjectSchema<AnyObject, LoginDto>}
 */
export const loginSchema = (): ObjectSchema<AnyObject, LoginDto> => {
	const $t = get(t);
	return object<LoginDto>({
		username: string()
			.default('')
			.required($t('api.dto.login.schema.validation.username.required')),
		password: string().default('').required($t('api.dto.login.schema.validation.password.required'))
	});
};
