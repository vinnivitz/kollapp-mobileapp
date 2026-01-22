import type { JoinOrganizationTO } from '$lib/api/dto';

import { get } from 'svelte/store';
import { type AnyObject, object, type ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Creates a schema for validating the `JoinOrganizationTO`.
 * @returns {ObjectSchema<JoinOrganizationTO>} The schema for validating the `JoinOrganizationTO`.
 */
export const joinOrganizationSchema = (): ObjectSchema<JoinOrganizationTO> => {
	const $t = get(t);
	return object({
		code: string()
			.default('')
			.length(8, $t('api.validation.organization.join-organization.code.length'))
			.required($t('api.validation.organization.join-organization.code.required'))
	} satisfies Record<keyof { code: string }, AnyObject>);
};
