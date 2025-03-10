import { get } from 'svelte/store';
import { ObjectSchema, type AnyObject, object, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Email DTO for sending email for verification.
 */
export type EmailDto = {
	email: string;
};

/**
 * Email schema for email verification.
 * @returns {ObjectSchema<AnyObject, EmailDto>} The schema for email verification.
 */
export const emailSchema = (): ObjectSchema<AnyObject, EmailDto> => {
	const $t = get(t);
	return object<EmailDto>({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.email.schema.validation.invalid'))
			.required($t('api.dto.email.schema.validation.required'))
	});
};
