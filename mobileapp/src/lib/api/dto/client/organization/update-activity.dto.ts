import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for updating an activity.
 */
export type UpdateActivityDto = {
	location: string;
	name: string;
};

/**
 * Creates a schema for validating the `UpdateActivityDto`.
 * @returns {ObjectSchema<AnyObject, UpdateActivityDto>} The schema for validating the `UpdateActivityDto`.
 */
export const updateActivitySchema = (): ObjectSchema<AnyObject, UpdateActivityDto> => {
	const $t = get(t);
	return object<UpdateActivityDto>({
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
	});
};
