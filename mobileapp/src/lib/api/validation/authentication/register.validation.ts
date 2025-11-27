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
			.email($t('email-is-invalid'))
			.max(50, $t('api.validation.email.max'))
			.required($t('api.validation.email.required')),
		password: string()
			.default('')
			.min(8, $t('api.validation.password.min'))
			.max(255, $t('api.validation.password.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.validation.password.pattern'))
			.required($t('api.validation.password.required')),
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.validation.username.min'))
			.max(20, $t('api.validation.username.max'))
			.required($t('api.validation.username.required'))
	} satisfies Record<keyof KollappUserSignupRequestTO & { confirmPassword: string }, AnyObject>);
};
