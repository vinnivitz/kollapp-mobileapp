import type { ForgotPasswordRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `ResetPasswordDto`.
 * @returns {ObjectSchema<ForgotPasswordRequestTO>} The schema for validating the `ForgotPasswordRequestTO`.
 */
export const forgotPasswordSchema = (): ObjectSchema<ForgotPasswordRequestTO> => {
	const $t = get(t);
	return object({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.reset-password.schema.validation.email.invalid'))
			.required($t('api.dto.reset-password.schema.validation.email.required'))
	} satisfies Record<keyof ForgotPasswordRequestTO, AnyObject>);
};
