import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for user login.
 */
export type LoginDto = {
	password: string;
	username: string;
};

/**
 * Creates a schema for validating the `LoginDto`.
 * @returns {ObjectSchema<AnyObject, LoginDto>} The schema for validating the `LoginDto`.
 */
export const loginSchema = (): ObjectSchema<AnyObject, LoginDto> => {
	const $t = get(t);
	return object<LoginDto>({
		password: string().default('').required($t('api.dto.login.schema.validation.password.required')),
		username: string().default('').trim().required($t('api.dto.login.schema.validation.username.required'))
	});
};
