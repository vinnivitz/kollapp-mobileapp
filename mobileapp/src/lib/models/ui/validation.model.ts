import type { ValidationCode } from '$lib/models/api';

/**
 * Validation model for form validation.
 */
export type ValidationError = {
	message: string;
	field?: string;
	code?: ValidationCode;
};

/**
 * Validation result for form validation retrieved from the api response.
 */
export type ValidationResult = {
	valid: boolean;
	errors?: ValidationError[];
};
