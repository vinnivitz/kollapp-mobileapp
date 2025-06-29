import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, ref, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for user registration.
 */
export type RegisterDto = {
	email: string;
	password: string;
	username: string;
	confirmPassword?: string;
};

/**
 * Creates a schema for validating the `RegisterDto`.
 * @returns {ObjectSchema<AnyObject, RegisterDto>} The schema for validating the `RegisterDto`.
 */
export const registerSchema = (): ObjectSchema<AnyObject, RegisterDto> => {
	const $t = get(t);
	return object<RegisterDto>({
		confirmPassword: string()
			.default('')
			.oneOf([ref('password')], $t('api.dto.register.schema.validation.confirm-password.no-match')),
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.register.schema.validation.email.email'))
			.max(50, $t('api.dto.register.schema.validation.email.max'))
			.required($t('api.dto.register.schema.validation.email.required')),
		password: string()
			.default('')
			.min(8, $t('api.dto.register.schema.validation.password.min'))
			.max(255, $t('api.dto.register.schema.validation.password.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.dto.register.schema.validation.password.matches'))
			.required($t('api.dto.register.schema.validation.password.required')),
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required'))
	});
};
