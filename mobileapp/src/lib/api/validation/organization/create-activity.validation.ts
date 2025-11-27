import type { ActivityCreationRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `CreateActivityDto`.
 * @returns {ObjectSchema<AnyObject, ActivityCreationRequestTO>} The schema for validating the `ActivityCreationRequestTO`.
 */
export const createActivitySchema = (): ObjectSchema<ActivityCreationRequestTO> => {
	const $t = get(t);
	return object({
		location: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.client.organization.create-activity.schema.validation.location.max'))
			.required($t('api.dto.client.organization.create-activity.schema.validation.location.required')),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.dto.client.organization.create-activity.schema.validation.name.max'))
			.required($t('api.dto.client.organization.create-activity.schema.validation.name.required'))
	} satisfies Record<keyof ActivityCreationRequestTO, AnyObject>);
};
