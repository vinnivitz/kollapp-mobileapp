import type { PasswordChangeRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { object, ObjectSchema, ref, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `PasswordChangeRequestTO`.
 * @returns {ObjectSchema<PasswordChangeRequestTO>} The schema for validating the `PasswordChangeRequestTO`.
 */
export const changePasswordSchema = (): ObjectSchema<PasswordChangeRequestTO> => {
	const $t = get(t);
	return object({
		confirmNewPassword: string()
			.default('')
			.oneOf([ref('newPassword')], $t('api.dto.change-password.schema.validation.confirm-password.no-match')),
		currentPassword: string()
			.default('')
			.required($t('api.dto.change-password.schema.validation.current-password.required')),
		newPassword: string()
			.default('')
			.min(8, $t('api.dto.change-password.schema.validation.new-password.min'))
			.max(255, $t('api.dto.change-password.schema.validation.new-password.max'))
			.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, $t('api.dto.change-password.schema.validation.new-password.matches'))
			.required($t('api.dto.change-password.schema.validation.new-password.required'))
	} satisfies Record<keyof PasswordChangeRequestTO & { confirmNewPassword: string }, unknown>);
};
