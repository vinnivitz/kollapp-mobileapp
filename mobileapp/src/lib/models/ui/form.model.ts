import type { ResponseBody } from '$lib/models/api';
import type { ValidationResult } from '$lib/models/ui';
import type { AnyObject, ObjectSchema } from 'yup';

import { getObjectFromSchema } from '$lib/utility';

abstract class AbstractForm<T, R> {
	abstract model: T;
	abstract config: FormConfig<T, R>;
}

/**
 * Actions that can be exposed from a custom form that is applied to a <form> element via Svelte Actions.
 */
export type FormActions<T = object> = {
	applyValidationFeedback: (result: ValidationResult<T>) => void;
	applyValidationFeedbackByKey: (key: keyof T, result: ValidationResult<T>) => void;
	onSubmit: () => void;
	onUpdate: (key: keyof T, value: T[keyof T]) => void;
	setModel: (model?: T) => void;
};

/**
 * Configuration for a custom form.
 */
export type FormConfig<T, R> = {
	schema: ObjectSchema<T & AnyObject>;
	customValidators?: (
		| (() => Promise<ValidationResult<T>> | ValidationResult<T>)
		| ((model: T) => Promise<ValidationResult<T>> | ValidationResult<T>)
	)[];
	formatters?: { [K in keyof T]?: (value: T[K]) => string };
	hiddenFields?: { [K in keyof T]?: T[K] };
	initialModel?: T;
	keyEventHandlers?: {
		[K in keyof T]?: (_event: KeyboardEvent, value: T[K], onUpdate: (value: T[K]) => void) => void;
	};
	parsers?: { [K in keyof T]?: (value: string) => T[K] };
	resetOnSubmit?: boolean;
	request: (model: T) => Promise<ResponseBody<R>>;
	completed?: (options: { actions: FormActions<T>; model: T; response: R }) => void;
	exposedActions?: (actions: FormActions<T>) => void;
	failed?: (result: ValidationResult<T>) => void;
	onBlur?: (key: keyof T) => void;
	onChange?: (options: { key: keyof T; value: T[keyof T] }) => void;
	onTouched?: () => void;
};

/**
 * Custom form class that can be used to create forms with validation and feedback.
 */
export class Form<T, R = unknown> extends AbstractForm<T, R> {
	model: T;
	config: FormConfig<T, R>;

	constructor(config: FormConfig<T, R>) {
		super();
		this.config = config;
		this.model = getObjectFromSchema(config.schema);
	}

	async submit(): Promise<ResponseBody<R>> {
		return this.config.request(this.model);
	}
}
