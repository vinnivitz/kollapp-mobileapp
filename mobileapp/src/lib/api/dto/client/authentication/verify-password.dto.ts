import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for verifying a user's password.
 */
export type VerifyPasswordDto = {
	password: string;
};

/**
 * Creates a schema for validating the `VerifyPasswordDto`.
 * @returns {ObjectSchema<AnyObject, VerifyPasswordDto>} The schema for validating the `VerifyPasswordDto`.
 */
export const verifyPasswordSchema = (): ObjectSchema<AnyObject, VerifyPasswordDto> => {
	const $t = get(t);
	return object<VerifyPasswordDto>({
		password: string().default('').required($t('api.dto.reset-password.schema.validation.newPassword.required'))
	});
};
