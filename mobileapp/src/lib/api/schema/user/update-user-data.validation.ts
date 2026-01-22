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
			.email($t('api.validation.user.update-user-data.email.invalid'))
			.max(50, $t('api.validation.user.update-user-data.email.max'))
			.required($t('api.validation.user.update-user-data.email.required')),
		username: string()
			.default('')
			.trim()
			.min(2, $t('api.validation.user.update-user-data.username.min'))
			.max(50, $t('api.validation.user.update-user-data.username.max'))
			.required($t('api.validation.user.update-user-data.username.required'))
	} satisfies Record<keyof KollappUserUpdateRequestTO, AnySchema>);
};
