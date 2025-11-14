import { get } from 'svelte/store';
import { type AnyObject, object, ObjectSchema, string } from 'yup';

import { t } from '$lib/locales';

/**
 * Data Transfer Object for resending a confirmation email.
 */
export type RensendConfirmationDto = {
	email: string;
};

/**
 * Creates a schema for validating the `RensendConfirmationDto`.
 * @returns {ObjectSchema<AnyObject, RensendConfirmationDto>} The schema for validating the `RensendConfirmationDto`.
 */
export const resendConfirmationSchema = (): ObjectSchema<RensendConfirmationDto> => {
	const $t = get(t);
	return object({
		email: string()
			.default('')
			.trim()
			.email($t('api.dto.resend-confirmation.schema.validation.email.invalid'))
			.required($t('api.dto.resend-confirmation.schema.validation.email.required'))
	} satisfies Record<keyof RensendConfirmationDto, AnyObject>);
};
