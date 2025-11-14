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
	} satisfies Record<keyof OrganizationCreationRequestTO, AnyObject>);
};
