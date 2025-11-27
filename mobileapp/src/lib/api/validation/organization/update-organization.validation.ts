import type { OrganizationUpdateRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `OrganizationUpdateRequestTO`.
 * @returns {ObjectSchema<OrganizationUpdateRequestTO>} The schema for validating the `OrganizationUpdateRequestTO`.
 */
export const updateOrganizationSchema = (): ObjectSchema<OrganizationUpdateRequestTO> => {
	const $t = get(t);
	return object({
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
	} satisfies Record<keyof OrganizationUpdateRequestTO, AnyObject>);
};
