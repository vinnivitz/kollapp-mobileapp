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
			.max(50, $t('api.validation.organization.update-activity.location.max'))
			.required($t('api.validation.organization.update-activity.location.required')),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.update-activity.name.max'))
			.required($t('api.validation.organization.update-activity.name.required'))
	} satisfies Record<keyof ActivityUpdateRequestTO, AnyObject>);
};
