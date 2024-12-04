export type ValidationError = {
	message: string;
	field?: string;
};

export type ValidationResult = {
	valid: boolean;
	errors?: ValidationError[];
};
