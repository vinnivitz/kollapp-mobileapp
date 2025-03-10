import { get } from 'svelte/store';
import { object, ObjectSchema, string, type AnyObject } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for creating an activity.
 */
export type CreateActivityDto = {
	name: string;
	location: string;
};

/**
 * Schema for creating an activity.
 * @returns {ObjectSchema<AnyObject, CreateActivityDto>} The schema for creating an activity.
 */
export const createActivitySchema = (): ObjectSchema<AnyObject, CreateActivityDto> => {
	const $t = get(t);
	return object<CreateActivityDto>({
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.create-activity.schema.validation.name.min'))
			.max(50, $t('api.dto.client.organization.create-activity.schema.validation.name.max'))
			.required($t('api.dto.client.organization.create-activity.schema.validation.name.required')),
		location: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.client.organization.create-activity.schema.validation.location.min'))
			.max(50, $t('api.dto.client.organization.create-activity.schema.validation.location.max'))
			.required($t('api.dto.client.organization.create-activity.schema.validation.location.required'))
	});
};
