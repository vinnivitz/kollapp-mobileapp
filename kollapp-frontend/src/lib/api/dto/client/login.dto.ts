import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Login DTO for sending user login information.
 */
export type LoginDto = {
	username: string;
	password: string;
};

/**
 * Login schema for user login.
 * @returns {ObjectSchema<AnyObject, LoginDto>} The schema for user login.
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
