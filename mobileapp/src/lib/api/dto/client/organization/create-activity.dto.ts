import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for creating an activity.
 */
export type CreateActivityDto = {
	location: string;
	name: string;
};

/**
 * Creates a schema for validating the `CreateActivityDto`.
 * @returns {ObjectSchema<AnyObject, CreateActivityDto>} The schema for validating the `CreateActivityDto`.
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
