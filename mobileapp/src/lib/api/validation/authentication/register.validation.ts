import type { KollappUserSignupRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `KollappUserSignupRequest`.
 * @returns {ObjectSchema<KollappUserSignupRequestTO & { confirmPassword: string }>} The schema for validating the `KollappUserSignupRequest`.
 */
export const registerSchema = (): ObjectSchema<KollappUserSignupRequestTO & { confirmPassword: string }> => {
	const $t = get(t);
	return object({
		confirmPassword: string().default(''),
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
	} satisfies Record<keyof KollappUserSignupRequestTO & { confirmPassword: string }, AnyObject>);
};
