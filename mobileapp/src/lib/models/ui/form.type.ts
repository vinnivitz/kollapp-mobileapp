import type { ResponseBody } from '$lib/models/api';
import type { ValidationResult } from '$lib/models/ui';
import type { AnyObject, ObjectSchema } from 'yup';

abstract class AbstractForm<T, R> {
	abstract model: T;
	abstract config: FormConfig<T, R>;
}

/**
 * Actions that can be exposed from a custom form that is applied to a <form> element via Svelte Actions.
 */
export type FormActions<T = object> = {
	patchByKey: (key: keyof T, value: T[keyof T]) => Promise<void>;
	set: (model?: T) => void;
};

/**
 * Configuration for a custom form.
 */
export type FormConfig<T, R> = {
	schema: ObjectSchema<T & AnyObject>;
	formatters?: { [K in keyof T]?: (value: T[K]) => string };
	hiddenFields?: { [K in keyof T]?: T[K] };
	keyEventHandlers?: {
		[K in keyof T]?: Record<string, (value: T[K], onUpdate: (value: T[K]) => void) => Promise<void> | void>;
	};
	parsers?: { [K in keyof T]?: (value: unknown) => T[K] };
	resetOnSubmit?: boolean;
	validators?: {
		[K in keyof T]?:
			| (() => Promise<ValidationResult<T>> | ValidationResult<T>)
			| ((model: T) => Promise<ValidationResult<T>> | ValidationResult<T>);
	};
	request: (model: T) => Promise<ResponseBody<R>>;
	actions?: (actions: FormActions<T>) => void;
	completed?: (options: { actions: FormActions<T>; model: T; response: R }) => void;
	failed?: (result: ValidationResult<T>) => void;
	onBlur?: (options: { key: keyof T; value: T[keyof T] }) => void;
	onInput?: (options: { key: keyof T; value: T[keyof T] }) => void;
	onTouched?: () => void;
};

/**
 * Custom form class that can be used to create forms with validation and feedback.
 */
export class Form<T, R> extends AbstractForm<T, R> {
	model: T;
	config: FormConfig<T, R>;

	constructor(config: FormConfig<T, R>) {
		super();
		this.config = config;
		this.model = config.schema.getDefault();
	}

	async submit(): Promise<ResponseBody<R>> {
		return this.config.request(this.model);
	}
}
