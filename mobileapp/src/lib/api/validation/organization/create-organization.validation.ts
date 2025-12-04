import type { OrganizationCreationRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `OrganizationCreationRequestTO`.
 * @returns {ObjectSchema<OrganizationCreationRequestTO>} The schema for validating the `OrganizationCreationRequestTO`.
 */
export const createOrganizationSchema = (): ObjectSchema<OrganizationCreationRequestTO> => {
	const $t = get(t);
	return object({
		description: string()
			.default('')
			.trim()
			.max(500, $t('api.validation.organization.create-organization.description.max'))
			.optional(),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.create-organization.name.max'))
			.required($t('api.validation.organization.create-organization.name.required')),
		place: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.create-organization.place.max'))
			.required($t('api.validation.organization.create-organization.place.required'))
	} satisfies Record<keyof OrganizationCreationRequestTO, AnyObject>);
};
