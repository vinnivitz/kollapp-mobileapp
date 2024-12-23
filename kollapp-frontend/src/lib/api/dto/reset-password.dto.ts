import { get } from 'svelte/store';
import { object, string, type AnyObject, type ObjectSchema } from 'yup';

import { t } from '$lib/locales';

/**
 * Reset password DTO for organization password reset.
 */
export type ResetPasswordDto = {
	password: string;
};

/**
 * Reset password schema for organization password reset.
 * @returns {ObjectSchema<AnyObject, ResetPasswordDto>}
 */
export const resetPasswordSchema = (): ObjectSchema<AnyObject, ResetPasswordDto> => {
	const $t = get(t);
	return object<ResetPasswordDto>({
		password: string()
			.default('')
			.min(8, $t('api.dto.reset-password.schema.validation.newPassword.min'))
			.max(255, $t('api.dto.reset-password.schema.validation.newPassword.max'))
			.matches(
				/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
				$t('api.dto.reset-password.schema.validation.newPassword.matches')
			)
			.required($t('api.dto.reset-password.schema.validation.newPassword.required'))
	});
};
