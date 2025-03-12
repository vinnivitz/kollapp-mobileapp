import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Update user data DTO for sending user update information.
 */
export type UpdateUserDataDto = {
	email: string;
	name: string;
	surname: string;
	username: string;
};

/**
 * Update user data schema for updating user data.
 * @returns {ObjectSchema<AnyObject, UpdateUserDataDto>} The schema for updating user data.
 */
export const updateUserDataSchema = (): ObjectSchema<AnyObject, UpdateUserDataDto> => {
	const $t = get(t);
	return object<UpdateUserDataDto>({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.register.schema.validation.email.email'))
			.max(50, $t('api.dto.register.schema.validation.email.max'))
			.required($t('api.dto.register.schema.validation.email.required')),
		name: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.name.min'))
			.max(255, $t('api.dto.register.schema.validation.name.max'))
			.required($t('api.dto.register.schema.validation.name.required')),
		surname: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.surname.min'))
			.max(255, $t('api.dto.register.schema.validation.surname.max'))
			.required($t('api.dto.register.schema.validation.surname.required')),
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required'))
	});
};
