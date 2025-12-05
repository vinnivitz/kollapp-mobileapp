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
			.max(500, $t('api.validation.organization.update-organization.description.max'))
			.optional(),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.update-organization.name.max'))
			.required($t('api.validation.organization.update-organization.name.required')),
		place: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.update-organization.place.max'))
			.required($t('api.validation.organization.update-organization.place.required'))
	} satisfies Record<keyof OrganizationUpdateRequestTO, AnyObject>);
};
