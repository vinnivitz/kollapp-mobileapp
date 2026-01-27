import type { PasswordDto } from '$lib/api/dto';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `PasswordDto`.
 * @returns {ObjectSchema<PasswordDto>} The schema for validating the `PasswordDto`.
 */
export const verifyPasswordSchema = (): ObjectSchema<PasswordDto> => {
	const $t = get(t);
	return object({
		password: string().default('').required($t('api.validation.authentication.verify-password.password.required'))
	} satisfies Record<keyof PasswordDto, AnyObject>);
};
