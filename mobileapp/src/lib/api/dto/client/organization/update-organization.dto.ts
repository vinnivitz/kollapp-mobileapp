import { get } from 'svelte/store';
import { object, string, type AnyObject, type ObjectSchema } from 'yup';

import { t } from '$lib/locales';

/**
 * DTO for updating organization information.
 */
export type UpdateOrganizationDto = {
	name: string;
};

/**
 * Schema for validating organization information.
 * @returns {ObjectSchema<AnyObject, UpdateOrganizationDto>} The schema for validating organization information.
 */
export const updateOrganizationSchema = (): ObjectSchema<AnyObject, UpdateOrganizationDto> => {
	const $t = get(t);
	return object<UpdateOrganizationDto>({
		name: string()
			.default('')
			.trim()
			.min(1, $t('api.dto.register-organization.schema.validation.name.min'))
			.max(50, $t('api.dto.register-organization.schema.validation.name.max'))
			.required($t('api.dto.register-organization.schema.validation.name.required'))
	});
};
