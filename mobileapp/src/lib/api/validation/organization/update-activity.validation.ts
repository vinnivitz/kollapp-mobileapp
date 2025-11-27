import type { ActivityUpdateRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `ActivityUpdateRequestTO`.
 * @returns {ObjectSchema<ActivityUpdateRequestTO>} The schema for validating the `ActivityUpdateRequestTO`.
 */
export const updateActivitySchema = (): ObjectSchema<ActivityUpdateRequestTO> => {
	const $t = get(t);
	return object({
		location: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.update-activity.schema.validation.location.min'))
			.max(50, $t('api.dto.client.organization.update-activity.schema.validation.location.max'))
			.required($t('api.dto.client.organization.update-activity.schema.validation.location.required')),
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.update-activity.schema.validation.name.min'))
			.max(50, $t('api.dto.client.organization.update-activity.schema.validation.name.max'))
			.required($t('api.dto.client.organization.update-activity.schema.validation.name.required'))
	} satisfies Record<keyof ActivityUpdateRequestTO, AnyObject>);
};
