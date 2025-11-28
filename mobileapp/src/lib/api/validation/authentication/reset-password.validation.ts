import type { ResetPasswordRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `ResetPasswordRequestTO`.
 * @returns {ObjectSchema<ResetPasswordRequestTO>} The schema for validating the `ResetPasswordRequestTO`.
 */
export const resetPasswordSchema = (): ObjectSchema<ResetPasswordRequestTO & { confirmPassword: string }> => {
	const $t = get(t);
	return object({
		confirmPassword: string().default(''),
		password: string()
			.default('')
			.min(8, $t('api.validation.authentication.reset-password.password.min'))
			.max(255, $t('api.validation.authentication.reset-password.password.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.validation.authentication.reset-password.password.pattern'))
			.required($t('api.validation.authentication.reset-password.password.required'))
	} satisfies Record<keyof ResetPasswordRequestTO & { confirmPassword: string }, AnyObject>);
};
