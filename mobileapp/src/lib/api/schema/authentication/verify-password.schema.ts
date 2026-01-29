import type { PasswordTO } from '$lib/api/dto';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `PasswordTO`.
 * @returns {ObjectSchema<PasswordTO>} The schema for validating the `PasswordTO`.
 */
export const verifyPasswordSchema = (): ObjectSchema<PasswordTO> => {
	const $t = get(t);
	return object({
		password: string().default('').required($t('api.validation.authentication.verify-password.password.required'))
	} satisfies Record<keyof PasswordTO, AnyObject>);
};
