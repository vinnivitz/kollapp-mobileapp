import type { CodeTO } from '$lib/api/dto';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `CodeTO`.
 * @returns {ObjectSchema<CodeTO>} The schema for validating the `CodeTO`.
 */
export const joinOrganizationSchema = (): ObjectSchema<CodeTO> => {
	const $t = get(t);
	return object({
		code: string()
			.default('')
			.length(8, $t('api.validation.organization.join-organization.code.length'))
			.required($t('api.validation.organization.join-organization.code.required'))
	} satisfies Record<keyof { code: string }, AnyObject>);
};
