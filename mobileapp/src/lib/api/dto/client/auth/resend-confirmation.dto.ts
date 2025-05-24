import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Resend confirmation DTO for sending email for verification.
 */
export type RensendConfirmationDto = {
	email: string;
};

/**
 * Resend confirmation schema for email verification.
 * @returns {ObjectSchema<AnyObject, RensendConfirmationDto>} The schema for resend confirmation.
 */
export const resendConfirmationSchema = (): ObjectSchema<AnyObject, RensendConfirmationDto> => {
	const $t = get(t);
	return object<RensendConfirmationDto>({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.resend-confirmation.schema.validation.email.invalid'))
			.required($t('api.dto.resend-confirmation.schema.validation.email.required'))
	});
};
