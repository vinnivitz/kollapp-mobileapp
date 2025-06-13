import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for creating an activity.
 */
export type CreateActivityDto = {
	location: string;
	name: string;
};

/**
 * Schema for creating an activity.
 * @returns {ObjectSchema<AnyObject, CreateActivityDto>} The schema for creating an activity.
 */
export const createActivitySchema = (): ObjectSchema<AnyObject, CreateActivityDto> => {
	const $t = get(t);
	return object<CreateActivityDto>({
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
	});
};
