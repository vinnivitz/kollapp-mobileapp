import type { PasswordChangeRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `PasswordChangeRequestTO`.
 * @returns {ObjectSchema<PasswordChangeRequestTO>} The schema for validating the `PasswordChangeRequestTO`.
 */
export const changePasswordSchema = (): ObjectSchema<PasswordChangeRequestTO & { confirmNewPassword: string }> => {
	const $t = get(t);
	return object({
		confirmNewPassword: string().default(''),
		currentPassword: string().default('').required($t('api.validation.user.change-password.current-password.required')),
		newPassword: string()
			.default('')
			.min(8, $t('api.validation.user.change-password.new-password.min'))
			.max(255, $t('api.validation.user.change-password.new-password.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.validation.user.change-password.new-password.matches'))
			.required($t('api.validation.user.change-password.new-password.required'))
	} satisfies Record<keyof PasswordChangeRequestTO & { confirmNewPassword: string }, unknown>);
};
