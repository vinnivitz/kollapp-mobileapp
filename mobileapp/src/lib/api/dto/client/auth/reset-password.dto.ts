import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Email DTO for sending email for verification.
 */
export type ResetPasswordDto = {
	email: string;
};

/**
 * Email schema for email verification.
 * @returns {ObjectSchema<AnyObject, ResetPasswordDto>} The schema for email verification.
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
