import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for registering an organization.
 */
export type RegisterOrganizationDto = {
	name: string;
	place: string;
	description?: string;
};

/**
 * Schema for registering an organization.
 * @returns {ObjectSchema<AnyObject, RegisterOrganizationDto>} The schema for registering an organization.
 */
export const registerOrganizationSchema = (): ObjectSchema<AnyObject, RegisterOrganizationDto> => {
	const $t = get(t);
	return object<RegisterOrganizationDto>({
		description: string()
			.default('')
			.trim()
			.max(500, $t('api.dto.register-organization.schema.validation.description.max'))
			.optional(),
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.register-organization.schema.validation.name.min'))
			.max(50, $t('api.dto.register-organization.schema.validation.name.max'))
			.required($t('api.dto.register-organization.schema.validation.name.required')),
		place: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.register-organization.schema.validation.place.max'))
			.required($t('api.dto.register-organization.schema.validation.place.required'))
	});
};
