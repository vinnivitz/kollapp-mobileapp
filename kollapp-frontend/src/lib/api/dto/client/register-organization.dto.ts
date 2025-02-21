import { get } from 'svelte/store';
import { object, string, type AnyObject, type ObjectSchema } from 'yup';

import { t } from '$lib/locales';

export type RegisterOrganizationDto = {
	name: string;
};

export const registerOrganizationSchema = (): ObjectSchema<AnyObject, RegisterOrganizationDto> => {
	const $t = get(t);
	return object<RegisterOrganizationDto>({
		name: string()
			.default('')
			.min(2, $t('api.dto.register-organization.schema.validation.name.min'))
			.max(255, $t('api.dto.register-organization.schema.validation.name.max'))
			.required($t('api.dto.register-organization.schema.validation.name.required'))
	});
};
