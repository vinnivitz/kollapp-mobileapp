import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string, ref } from 'yup';

import { t } from '$lib/locales';

/**
 * Register DTO for sending user registration information.
 */
export type RegisterDto = {
	surname: string;
	name: string;
	username: string;
	email: string;
	password: string;
	confirmPassword?: string;
};

/**
 * Register schema for user registration.
 * @returns {ObjectSchema<AnyObject, RegisterDto>} The schema for user registration.
 */
export const registerSchema = (): ObjectSchema<AnyObject, RegisterDto> => {
	const $t = get(t);
	return object<RegisterDto>({
		surname: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.surname.min'))
			.max(255, $t('api.dto.register.schema.validation.surname.max'))
			.required($t('api.dto.register.schema.validation.surname.required')),
		name: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.name.min'))
			.max(255, $t('api.dto.register.schema.validation.name.max'))
			.required($t('api.dto.register.schema.validation.name.required')),
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
			.required($t('api.dto.register.schema.validation.password.required')),
		confirmPassword: string()
			.default('')
			.oneOf([ref('password')], $t('api.dto.register.schema.validation.confirm-password.no-match'))
	});
};
