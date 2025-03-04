import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Update user data DTO for sending user update information.
 */
export type UpdateUserDataDto = {
	surname: string;
	name: string;
	username: string;
	email: string;
};

/**
 * Update user data schema for updating user data.
 * @returns {ObjectSchema<AnyObject, UpdateUserDataDto>} The schema for updating user data.
 */
export const updateUserDataSchema = (): ObjectSchema<AnyObject, UpdateUserDataDto> => {
	const $t = get(t);
	return object<UpdateUserDataDto>({
		surname: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.surname.min'))
			.max(255, $t('api.dto.register.schema.validation.surname.max'))
			.required($t('api.dto.register.schema.validation.surname.required')),
		name: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.name.min'))
			.max(255, $t('api.dto.register.schema.validation.name.max'))
			.required($t('api.dto.register.schema.validation.name.required')),
		username: string()
			.default('')
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required')),
		email: string()
			.default('')
			.email($t('api.dto.register.schema.validation.email.email'))
			.max(50, $t('api.dto.register.schema.validation.email.max'))
			.required($t('api.dto.register.schema.validation.email.required'))
	});
};
