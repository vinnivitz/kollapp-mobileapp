import type { ValidationCode } from '$lib/models/api';

/**
 * Validation model for form validation.
 */
export type ValidationError = {
	code?: ValidationCode;
	field?: string;
	message: string;
};

/**
 * Validation result for form validation retrieved from the api response.
 */
export type ValidationResult = {
	errors?: ValidationError[];
	valid: boolean;
};
