import type { ValidationResult } from '$lib/models/ui';

import { type AnyObject, ObjectSchema } from 'yup';

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
	onSubmit: () => void;
	onUpdate: (key: keyof T, value: T[keyof T]) => void;
	resetModel: () => void;
};

/**
 * Configuration for a custom form.
 */
export type FormConfig<T> = {
	schema: ObjectSchema<AnyObject, T>;
	customValidators?: (
		| (() => Promise<ValidationResult> | ValidationResult)
		| ((model: T) => Promise<ValidationResult> | ValidationResult)
	)[];
	formatters?: { [K in keyof T]?: (value: T[K]) => string };
	keyEventHandlers?: {
		[K in keyof T]?: (_event: KeyboardEvent, onUpdate: (value: T[K]) => void) => void;
	};
	parser?: { [K in keyof T]?: (value: string) => T[K] };
	exposedActions?: (actions: FormActions<T>) => void;
	onBlur?: (key: keyof T) => void;
	onChange?: (key: keyof T, value: T[keyof T]) => void;
	onSubmit?: (model: T, result: ValidationResult) => void;
	onTouched?: () => void;
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
