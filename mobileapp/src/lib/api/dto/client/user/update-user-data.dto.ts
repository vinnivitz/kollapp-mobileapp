import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for updating user data.
 */
export type UpdateUserDataDto = {
	email: string;
	username: string;
};

/**
 * Creates a schema for validating the `UpdateUserDataDto`.
 * @returns {ObjectSchema<AnyObject, UpdateUserDataDto>} The schema for validating the `UpdateUserDataDto`.
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
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required'))
	});
};
