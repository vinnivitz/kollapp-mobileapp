import type { JoinOrganizationTO } from '$lib/api/dtos';

import { type AnyObject, object, type ObjectSchema, string } from 'yup';

/**
 * Creates a schema for validating the `JoinOrganizationTO`.
 * @returns {ObjectSchema<JoinOrganizationTO>} The schema for validating the `JoinOrganizationTO`.
 */
export const joinOrganizationSchema = (): ObjectSchema<JoinOrganizationTO> => {
	return object({
		code: string().default('').length(8, 'Code must be exactly 8 characters long').required('Code is required')
	} satisfies Record<keyof { code: string }, AnyObject>);
};
