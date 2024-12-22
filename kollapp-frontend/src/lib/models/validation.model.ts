/**
 * Validation model for form validation.
 */
export type ValidationError = {
	message: string;
	field?: string;
};

/**
 * Validation result for form validation retrieved from the api response.
 */
export type ValidationResult = {
	valid: boolean;
	errors?: ValidationError[];
};
