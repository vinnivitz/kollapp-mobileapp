import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for registering an organization.
 */
export type RegisterOrganizationDto = {
	name: string;
};

/**
 * Schema for registering an organization.
 * @returns {ObjectSchema<AnyObject, RegisterOrganizationDto>} The schema for registering an organization.
 */
export const registerOrganizationSchema = (): ObjectSchema<AnyObject, RegisterOrganizationDto> => {
	const $t = get(t);
	return object<RegisterOrganizationDto>({
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.register-organization.schema.validation.name.min'))
			.max(50, $t('api.dto.register-organization.schema.validation.name.max'))
			.required($t('api.dto.register-organization.schema.validation.name.required'))
	});
};
