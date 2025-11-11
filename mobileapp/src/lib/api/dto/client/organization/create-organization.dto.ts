import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for creating an organization.
 */
export type CreateOrganizationDto = {
	name: string;
	place: string;
	description?: string;
};

/**
 * Creates a schema for validating the `CreateOrganizationDto`.
 * @returns {ObjectSchema<AnyObject, CreateOrganizationDto>} The schema for validating the `CreateOrganizationDto`.
 */
export const createOrganizationSchema = (): ObjectSchema<AnyObject, CreateOrganizationDto> => {
	const $t = get(t);
	return object<CreateOrganizationDto>({
		description: string()
			.default('')
			.trim()
			.max(500, $t('api.dto.register-organization.schema.validation.description.max'))
			.optional(),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.register-organization.schema.validation.name.max'))
			.required($t('api.dto.register-organization.schema.validation.name.required')),
		place: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.register-organization.schema.validation.place.max'))
			.required($t('api.dto.register-organization.schema.validation.place.required'))
	});
};
