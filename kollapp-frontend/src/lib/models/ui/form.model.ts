import { ObjectSchema, type AnyObject } from 'yup';

import type { ValidationResult } from '$lib/models/ui';

abstract class AbstractForm<T> {
	abstract model: T;
	abstract config: FormConfig<T>;
}

/**
 * Actions that can be exposed from a custom form that is applied to a <form> element via Svelte Actions.
 */
export type FormActions<T = object> = {
	applyValidationFeedback: (result: ValidationResult) => void;
	applyValidationFeedbackByKey: (key: keyof T, result: ValidationResult) => void;
	onUpdate: (key: keyof T, value: T[keyof T]) => void;
	resetModel: () => void;
	onSubmit: () => void;
};

/**
 * Configuration for a custom form.
 */
export type FormConfig<T> = {
	schema: ObjectSchema<AnyObject, T>;
	onChange?: (key: keyof T, value: T[keyof T]) => void | Promise<void>;
	onSubmit?: (model: T, result: ValidationResult) => void;
	onTouched?: () => void;
	onBlur?: (key: keyof T) => void;
	exposedActions?: (actions: FormActions<T>) => void;
	customValidators?: (
		| ((model: T) => ValidationResult | Promise<ValidationResult>)
		| (() => ValidationResult | Promise<ValidationResult>)
	)[];
	formatters?: { [K in keyof T]?: (value: T[K]) => T[K] };
	parser?: { [K in keyof T]?: (value: T[K]) => Promise<T[K]> };
};

/**
 * Custom form class that can be used to create forms with validation and feedback.
 */
export class Form<T> extends AbstractForm<T> {
	model: T;
	config: FormConfig<T> = { schema: new ObjectSchema() };

	constructor(model: T, config?: FormConfig<T>) {
		super();
		this.model = model;
		if (config) {
			this.config = config;
		}
	}
}
