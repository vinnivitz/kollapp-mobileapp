import type { ValidationResult } from '$lib/models/ui';

import { get } from 'svelte/store';

import { t } from '$lib/locales';

/**
 * Creates a password confirmation validator for a specific confirmation field
 * This validator should be assigned to the confirmPassword field in customValidators
 * @param passwordField The name of the password field to match against
 * @param confirmPasswordField The name of the confirmation password field
 * @returns {(model: T) => ValidationResult<T>} A validator function that can be used in FormConfig.customValidators
 */
export function passwordConfirmationValidator<T>(
	passwordField: keyof T,
	confirmPasswordField: keyof T
): (model: T) => ValidationResult<T> {
	return (model: T): ValidationResult<T> => {
		const password = model[passwordField];
		const confirmFieldKey = confirmPasswordField;
		const confirmPassword = model[confirmFieldKey];

		if (!password && !confirmPassword) {
			return { valid: true };
		}

		if (password && !confirmPassword) {
			const $t = get(t);
			return {
				errors: [
					{
						field: confirmFieldKey,
						message: $t('utility.form-validators.password-confirmation.no-match')
					}
				],
				valid: false
			};
		}

		// eslint-disable-next-line security/detect-possible-timing-attacks
		if (password !== confirmPassword) {
			const $t = get(t);
			return {
				errors: [
					{
						field: confirmFieldKey,
						message: $t('utility.form-validators.password-confirmation.no-match')
					}
				],
				valid: false
			};
		}

		return { valid: true };
	};
}
