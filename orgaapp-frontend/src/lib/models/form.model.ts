import { ObjectSchema, type AnyObject } from 'yup';

import type { ValidationResult } from './validation.model';

/**
 * Actions that can be exposed from a custom form that is applied to a <form> element via Svelte Actions.
 */
export type FormActions<T = object> = {
	applyValidationFeedback: (result: ValidationResult) => void;
	applyValidationFeedbackByKey: (key: string, result: ValidationResult) => void;
	applyValidationFeedbackByName: (name: string, result: ValidationResult) => void;
	onUpdate: (key: string, value: T[keyof T]) => void;
	resetModel: () => void;
	onSubmit: () => void;
};

/**
 * Configuration for a custom form.
 */
export type FormConfig<T> = {
	schema: ObjectSchema<AnyObject, T>;
	onChange?: (key: string, value: string | number) => void | Promise<void>;
	onSubmit?: (model: T, result: ValidationResult) => void;
	onTouched?: () => void;
	onBlur?: (key: string) => void;
	exposedActions?: (actions: FormActions<T>) => void;
	customValidators?: (
		| ((model: T) => ValidationResult | Promise<ValidationResult>)
		| (() => ValidationResult | Promise<ValidationResult>)
	)[];
	formatters?: { [K in keyof T]?: (value: T[K]) => string | number };
	parser?: { [K in keyof T]?: (value: string | number) => Promise<T[K]> };
};

/**
 * Custom form class that can be used to create forms with validation and feedback.
 */
export class Form<T> {
	model: T;
	config: FormConfig<T> = { schema: new ObjectSchema() };

	constructor(model: T, config?: FormConfig<T>) {
		this.model = model;
		if (config) {
			this.config = config;
		}
	}
}
