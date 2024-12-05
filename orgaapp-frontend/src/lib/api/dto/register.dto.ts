import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Register DTO for user registration.
 */
export type RegisterDto = {
	username: string;
	email: string;
	password: string;
};

/**
 * Register schema for user registration.
 * @returns {ObjectSchema<AnyObject, RegisterDto>}
 */
export const registerSchema = (): ObjectSchema<AnyObject, RegisterDto> => {
	const $t = get(t);
	return object<RegisterDto>({
		username: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required')),
		email: string()
			.default('')
			.email($t('api.dto.register.schema.validation.email.email'))
			.max(50, $t('api.dto.register.schema.validation.email.max'))
			.required($t('api.dto.register.schema.validation.email.required')),
		password: string()
			.default('')
			.min(8, $t('api.dto.register.schema.validation.password.min'))
			.max(255, $t('api.dto.register.schema.validation.password.max'))
			.matches(
				/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
				$t('api.dto.register.schema.validation.password.matches')
			)
			.required($t('api.dto.register.schema.validation.password.required'))
	});
};
