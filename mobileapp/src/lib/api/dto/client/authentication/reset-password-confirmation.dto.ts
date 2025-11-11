import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, ref, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for resetting a user's password.
 */
export type ResetPasswordConfirmationDto = {
	password: string;
	confirmPassword?: string;
};

/**
 * Creates a schema for validating the `ResetPasswordConfirmationDto`.
 * @returns {ObjectSchema<AnyObject, ResetPasswordConfirmationDto>} The schema for validating the `ResetPasswordConfirmationDto`.
 */
export const resetPasswordConfirmationSchema = (): ObjectSchema<AnyObject, ResetPasswordConfirmationDto> => {
	const $t = get(t);
	return object<ResetPasswordConfirmationDto>({
		confirmPassword: string()
			.default('')
			.oneOf([ref('password')], $t('api.dto.reset-password.schema.validation.confirm-password.no-match')),
		password: string()
			.default('')
			.min(8, $t('api.dto.reset-password.schema.validation.newPassword.min'))
			.max(255, $t('api.dto.reset-password.schema.validation.newPassword.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.dto.reset-password.schema.validation.newPassword.matches'))
			.required($t('api.dto.reset-password.schema.validation.newPassword.required'))
	});
};
