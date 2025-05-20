import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Verify password DTO for enable biometrics.
 */
export type VerifyPasswordDto = {
	password: string;
};

/**
 * Verify password schema for enable biometrics.
 * @returns {ObjectSchema<AnyObject, VerifyPasswordDto>} The schema for user password reset.
 */
export const verifyPasswordSchema = (): ObjectSchema<AnyObject, VerifyPasswordDto> => {
	const $t = get(t);
	return object<VerifyPasswordDto>({
		password: string().default('').required($t('api.dto.reset-password.schema.validation.newPassword.required'))
	});
};
