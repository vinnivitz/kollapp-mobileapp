import { ObjectSchema, type AnyObject } from 'yup';

import type { ValidationResult } from './validation.model';

export type FormActions<T = object> = {
	applyValidationFeedback: (result: ValidationResult) => void;
	applyValidationFeedbackByKey: (key: string, result: ValidationResult) => void;
	applyValidationFeedbackByName: (name: string, result: ValidationResult) => void;
	onUpdate: (key: string, value: T[keyof T]) => void;
	resetModel: () => void;
	onSubmit: () => void;
};

export type FormConfig<T> = {
	schema: ObjectSchema<AnyObject, T>;
	onChange?: (key: string, value: string | number) => void | Promise<void>;
	onSubmit?: (model: T, result: ValidationResult) => void;
	onTouched?: () => void;
	onBlur?: (key: string) => void;
	exposedActions?: (actions: FormActions<T>) => void;
	customValidators?: ((model: T) => ValidationResult | Promise<ValidationResult>)[];
	formatters?: { [K in keyof T]?: (value: T[K]) => string | number };
	parser?: { [K in keyof T]?: (value: string | number) => Promise<T[K]> };
};

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
