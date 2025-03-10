import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for updating an activity.
 */
export type UpdateActivityDto = {
	name: string;
	location: string;
};

/**
 * Schema for updating an activity.
 * @returns {ObjectSchema<AnyObject, UpdateActivityDto>} The schema for updating an activity.
 */
export const updateActivitySchema = (): ObjectSchema<AnyObject, UpdateActivityDto> => {
	const $t = get(t);
	return object<UpdateActivityDto>({
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.update-activity.schema.validation.name.min'))
			.max(50, $t('api.dto.client.organization.update-activity.schema.validation.name.max'))
			.required($t('api.dto.client.organization.update-activity.schema.validation.name.required')),
		location: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.update-activity.schema.validation.location.min'))
			.max(50, $t('api.dto.client.organization.update-activity.schema.validation.location.max'))
			.required($t('api.dto.client.organization.update-activity.schema.validation.location.required'))
	});
};
