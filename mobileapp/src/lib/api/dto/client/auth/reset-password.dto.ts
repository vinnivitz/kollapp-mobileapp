import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for resetting a user's password.
 */
export type ResetPasswordDto = {
	email: string;
};

/**
 * Creates a schema for validating the `ResetPasswordDto`.
 * @returns {ObjectSchema<AnyObject, ResetPasswordDto>} The schema for validating the `ResetPasswordDto`.
 */
export const resetPasswordSchema = (): ObjectSchema<AnyObject, ResetPasswordDto> => {
	const $t = get(t);
	return object<ResetPasswordDto>({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.reset-password.schema.validation.email.invalid'))
			.required($t('api.dto.reset-password.schema.validation.email.required'))
	});
};
