import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for updating organization information.
 */
export type UpdateOrganizationDto = {
	name: string;
	place: string;
	description?: string;
};

/**
 * Schema for validating organization information.
 * @returns {ObjectSchema<AnyObject, UpdateOrganizationDto>} The schema for validating organization information.
 */
export const updateOrganizationSchema = (): ObjectSchema<AnyObject, UpdateOrganizationDto> => {
	const $t = get(t);
	return object<UpdateOrganizationDto>({
		description: string()
			.default('')
			.trim()
			.max(500, $t('api.dto.update-organization.schema.validation.description.max'))
			.optional(),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.update-organization.schema.validation.name.max'))
			.required($t('api.dto.update-organization.schema.validation.name.required')),
		place: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.update-organization.schema.validation.place.max'))
			.required($t('api.dto.update-organization.schema.validation.place.required'))
	});
};
