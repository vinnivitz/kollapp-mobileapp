import type { LoginRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `LoginRequestTO`.
 * @returns {ObjectSchema<LoginRequestTO>} The schema for validating the `LoginRequestTO`.
 */
export const loginSchema = (): ObjectSchema<LoginRequestTO> => {
	const $t = get(t);
	return object({
		password: string().default('').required($t('api.validation.authentication.login.password.required')),
		username: string().default('').trim().required($t('api.validation.authentication.login.username.required'))
	} satisfies Record<keyof LoginRequestTO, AnyObject>);
};
