import type { KollappUserUpdateRequestTO } from '@kollapp/api-types';
import type { AnySchema } from 'yup';

import { get } from 'svelte/store';
import { object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `KollappUserUpdateRequestTO`.
 * @returns {ObjectSchema<AnyObject, KollappUserUpdateRequestTO>} The schema for validating the `KollappUserUpdateRequestTO`.
 */
export const updateUserDataSchema = (): ObjectSchema<KollappUserUpdateRequestTO> => {
	const $t = get(t);
	return object({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.register.schema.validation.email.email'))
			.max(50, $t('api.dto.register.schema.validation.email.max'))
			.required($t('api.dto.register.schema.validation.email.required')),
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.dto.register.schema.validation.username.min'))
			.max(255, $t('api.dto.register.schema.validation.username.max'))
			.required($t('api.dto.register.schema.validation.username.required'))
	} satisfies Record<keyof KollappUserUpdateRequestTO, AnySchema>);
};
