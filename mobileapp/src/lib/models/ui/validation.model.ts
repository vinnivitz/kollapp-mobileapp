import type { ValidationCode } from '$lib/models/api';

/**
 * Validation model for form validation.
 */
export type ValidationError<T> = {
	message: string;
	code?: ValidationCode;
	field?: keyof T;
};

/**
 * Validation result for form validation retrieved from the api response.
 */
export type ValidationResult<T> = {
	valid: boolean;
	errors?: ValidationError<T>[];
};
