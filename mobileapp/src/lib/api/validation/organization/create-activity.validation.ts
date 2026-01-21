import type { ActivityCreationRequestTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
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
		date: string()
			.default(format(new TZDate(), 'yyyy-MM-dd'))
			.required($t('api.validation.organization.create-activity.date.required')),
		location: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.create-activity.location.max'))
			.required($t('api.validation.organization.create-activity.location.required')),
		name: string()
			.default('')
			.trim()
			.max(50, $t('api.validation.organization.create-activity.name.max'))
			.required($t('api.validation.organization.create-activity.name.required'))
	} satisfies Record<keyof ActivityCreationRequestTO, AnyObject>);
};
