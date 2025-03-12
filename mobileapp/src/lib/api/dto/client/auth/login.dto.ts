import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Login DTO for sending user login information.
 */
export type LoginDto = {
	password: string;
	username: string;
};

/**
 * Login schema for user login.
 * @returns {ObjectSchema<AnyObject, LoginDto>} The schema for user login.
 */
export const loginSchema = (): ObjectSchema<AnyObject, LoginDto> => {
	const $t = get(t);
	return object<LoginDto>({
		password: string().default('').required($t('api.dto.login.schema.validation.password.required')),
		username: string().default('').trim().required($t('api.dto.login.schema.validation.username.required'))
	});
};
