import type { ValidationResult } from '$lib/models/ui';

import { get } from 'svelte/store';

import { t } from '$lib/locales';

/**
 * Validates that a password confirmation field matches the password field
 * @param passwordField The name of the password field to match against
 * @param confirmPasswordField The name of the confirmation password field
 * @returns A validator function that can be used in FormConfig.customValidators
 */
export function passwordConfirmationValidator<T>(
	passwordField: keyof T,
	confirmPasswordField: keyof T
): (model: T) => ValidationResult<T> {
	return (model: T): ValidationResult<T> => {
		const password = model[passwordField];
		const confirmPassword = model[confirmPasswordField];

		if (!password || !confirmPassword) {
			return { valid: true };
		}

		// eslint-disable-next-line security/detect-possible-timing-attacks
		if (password !== confirmPassword) {
			const $t = get(t);
			return {
				errors: [
					{
						field: confirmPasswordField,
						message: $t('api.dto.register.schema.validation.confirm-password.no-match')
					}
				],
				valid: false
			};
		}

		return { valid: true };
	};
}
