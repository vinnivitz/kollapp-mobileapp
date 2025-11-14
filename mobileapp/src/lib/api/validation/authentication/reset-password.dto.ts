import type { ResetPasswordRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, ref, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `ResetPasswordRequestTO`.
 * @returns {ObjectSchema<ResetPasswordRequestTO>} The schema for validating the `ResetPasswordRequestTO`.
 */
export const resetPasswordSchema = (): ObjectSchema<ResetPasswordRequestTO> => {
	const $t = get(t);
	return object({
		confirmPassword: string()
			.default('')
			.oneOf([ref('password')], $t('api.dto.reset-password.schema.validation.confirm-password.no-match')),
		password: string()
			.default('')
			.min(8, $t('api.dto.reset-password.schema.validation.newPassword.min'))
			.max(255, $t('api.dto.reset-password.schema.validation.newPassword.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.dto.reset-password.schema.validation.newPassword.matches'))
			.required($t('api.dto.reset-password.schema.validation.newPassword.required'))
	} satisfies Record<keyof ResetPasswordRequestTO & { confirmPassword: string }, AnyObject>);
};
