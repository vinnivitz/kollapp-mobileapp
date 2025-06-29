import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, ref, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for changing user password.
 */
export type ChangePasswordDto = {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword?: string;
};

/**
 * Creates a schema for validating the `ChangePasswordDto`.
 * @returns {ObjectSchema<AnyObject, ChangePasswordDto>} The schema for validating the `ChangePasswordDto`.
 */
export const changePasswordSchema = (): ObjectSchema<AnyObject, ChangePasswordDto> => {
	const $t = get(t);
	return object<ChangePasswordDto>({
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
	});
};
