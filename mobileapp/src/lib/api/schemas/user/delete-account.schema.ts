import type { DeleteAccountRequestTO } from '@kollapp/api-types';

import { get } from 'svelte/store';
import { object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `DeleteAccountRequestTO`.
 * @returns {ObjectSchema<DeleteAccountRequestTO>} The schema for validating the `DeleteAccountRequestTO`.
 */
export const deleteAccountSchema = (): ObjectSchema<DeleteAccountRequestTO> => {
	const $t = get(t);
	return object({
		password: string().default('').required($t('api.validation.user.delete-account.password.required'))
	} satisfies Record<keyof DeleteAccountRequestTO, unknown>);
};
