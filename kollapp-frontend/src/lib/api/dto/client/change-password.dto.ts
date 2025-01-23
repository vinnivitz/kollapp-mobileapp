import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Change password DTO for sending user password change information.
 */
export type ChangePasswordDto = {
	currentPassword: string;
	newPassword: string;
};

export const changePasswordSchema = (): ObjectSchema<AnyObject, ChangePasswordDto> => {
	const $t = get(t);
	return object<ChangePasswordDto>({
		currentPassword: string()
			.default('')
			.required($t('api.dto.change-password.schema.validation.current-password.required')),
		newPassword: string()
			.default('')
			.min(8, $t('api.dto.change-password.schema.validation.new-password.min'))
			.max(255, $t('api.dto.change-password.schema.validation.new-password.max'))
			.matches(
				/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
				$t('api.dto.change-password.schema.validation.new-password.matches')
			)
			.required($t('api.dto.change-password.schema.validation.new-password.required'))
	});
};
