import { loadingController } from 'ionic-svelte';
import { eye, eyeOff } from 'ionicons/icons';
import { type AnyObject, type ObjectSchema, ValidationError } from 'yup';

import {
	type ValidationError as CustomValidationError,
	Form,
	type FormActions,
	type ValidationResult
} from '$lib/models/ui';
import { getObjectFromSchema, getValidationResult } from '$lib/utility';

/**
 * Creates a custom form with validation and feedback
 * @param node form element
 * @param data form data
 * @returns {destroy} function to remove the event listeners
 */
export function customForm<T, R>(node: HTMLFormElement, data: Form<T, R>): { destroy(): void } {
	let dirty = false;
	const inputs = [...node.querySelectorAll('ion-input'), ...node.querySelectorAll('ion-textarea')];
	const fields: Record<string, HTMLIonInputElement | HTMLIonTextareaElement> = {};
	for (const input of inputs) {
		fields[input.name] = input;
	}
	const customInputs = [...node.querySelectorAll('[data-name]')] as HTMLElement[];
	const keys = Object.keys(data.model as object);
	const passwordIcons: HTMLIonIconElement[] = [];
	const teardowns: Array<() => void> = [];

	const actions: FormActions<T> = {
		applyValidationFeedback,
		applyValidationFeedbackByKey,
		onSubmit,
		onUpdate,
		setModel
	};

	data.config.exposedActions?.(actions);

	if (data.config.keyEventHandlers) {
		for (const key of Object.keys(data.config.keyEventHandlers) as Array<keyof T>) {
			const handler = data.config.keyEventHandlers[key];
			const input = fields[key as string];
			if (handler && input) {
				addListener(input, 'keydown', (_event) => {
					handler(_event as KeyboardEvent, data.model[key], onUpdate.bind(undefined, key));
				});
			}
		}
	}

	for (const input of inputs) {
		input.classList.add('ion-touched');
		const formatter = data.config.formatters?.[input.name as keyof T];
		input.value = (
			formatter ? formatter(data.model[input.name as keyof T]) : data.model[input.name as keyof T]
		) as string;
		if (isIonInputElement(input) && input.type === 'password') {
			input.clearOnEdit = false;
			addPasswordIcon(input);
		}
	}

	addListener(node, 'ionInput', (event) => {
		const input = event.target as HTMLInputElement;
		if (input && keys.includes(input.name)) {
			onChange(event);
		}
	});

	addListener(node, 'ionBlur', async (event) =>
		data.config.onBlur?.((event.target as HTMLInputElement).name as keyof T)
	);

	node.noValidate = true;
	addListener(node, 'submit', onSubmit);

	function addPasswordIcon(input: HTMLIonInputElement): void {
		const icon = document.createElement('ion-icon') as HTMLIonIconElement;
		icon.setAttribute('slot', 'end');
		icon.setAttribute('icon', eye);
		icon.classList.add('invisible');
		input.after(icon);
		input.addEventListener('input', (event) =>
			icon.classList.toggle('invisible', (event.target as HTMLInputElement).value?.length === 0)
		);
		icon.addEventListener('click', () => {
			input.type = input.type === 'password' ? 'text' : 'password';
			icon.setAttribute('icon', input.type === 'password' ? eye : eyeOff);
		});
		passwordIcons.push(icon);
	}

	function setModel(model?: T): void {
		data.model = model ?? (data.config.schema.cast({}) as T);
		for (const input of inputs) {
			input.classList.remove('ion-invalid');
			input.errorText = '';
			const key = input.name as keyof T;
			input.value = data.config.formatters?.[key]
				? data.config.formatters[key](data.model[key])
				: (data.model[key] as string);
		}
		for (const input of customInputs) {
			removeCustomValidationFeedback(input);
		}
	}

	function removeCustomValidationFeedback(input: HTMLElement): void {
		const ionItem = input.closest('ion-item');
		if (ionItem) {
			ionItem.style.removeProperty('--border-color');
			const label = ionItem.querySelector('ion-label');
			if (label) {
				label.style.removeProperty('--color');
			} else {
				ionItem.style.removeProperty('--color');
			}
			const nextElement = ionItem.nextElementSibling as HTMLElement;
			if (nextElement && Object.hasOwn(nextElement.dataset, 'error')) {
				nextElement.remove();
			}
		}
	}

	function onTouched(): void {
		data.config.onTouched?.();
	}

	async function onUpdate(key: keyof T, value: T[keyof T]): Promise<void> {
		const formatter = data.config.formatters?.[key as keyof T];
		if (formatter) {
			const input = fields[key as string];
			if (input) {
				input.value = formatter(value) as string;
			}
		}
		_onUpdate(key, value);
	}

	async function _onUpdate(key: keyof T, value: T[keyof T]): Promise<void> {
		data.model[key as keyof T] = value;
		onTouched();
		if (dirty) {
			const validationResult = await runCustomValidators(await validate(data.config.schema, data.model));
			applyValidationFeedbackByKey(key, validationResult);
		}
	}

	function applyValidationFeedback(result: ValidationResult<T>): void {
		for (const input of inputs) {
			applyValidationFeedbackByKey(input.name as keyof T, result);
		}
		for (const input of customInputs) {
			applyValidationFeedbackByKey(input.dataset.name as keyof T, result);
		}
	}

	function applyValidationFeedbackByKey(key: keyof T, result: ValidationResult<T>): void {
		const input = fields[key as string];
		const message = result.errors?.find((error) => error.field === key)?.message;

		if (input) {
			if (message) {
				input.classList.add('ion-invalid');
				input.errorText = message;
			} else {
				input.classList.remove('ion-invalid');
				input.errorText = '';
			}
		} else {
			const customInput = customInputs.find((input) => input.dataset.name === key);
			if (customInput) {
				removeCustomValidationFeedback(customInput);
				if (message) {
					applyCustomValidationFeedback(customInput, message);
				}
			}
		}
	}

	async function runCustomValidators(validationResult: ValidationResult<T>): Promise<ValidationResult<T>> {
		for (const validator of data.config.customValidators || []) {
			const result = await validator(data.model);
			if (!result.valid) {
				validationResult.errors = [...(validationResult.errors || []), ...(result.errors || [])];
				validationResult.valid = false;
			}
		}
		return validationResult;
	}

	function onChange(event: Event): void {
		const key = (event.target as HTMLInputElement).name as keyof T;
		const value = (event.target as HTMLInputElement).value;
		const parser = data.config.parsers?.[key as keyof T];
		const parsed = parser ? parser(value) : value;
		onUpdate(key, parsed as T[keyof T]);
		data.config.onChange?.(key, parsed as T[keyof T]);
	}

	async function onSubmit(event?: Event): Promise<void> {
		dirty = true;
		event?.preventDefault();
		let validationResult = await validate(data.config.schema, data.model);
		if (data.config.customValidators) {
			validationResult = await runCustomValidators(validationResult);
		}
		if (!validationResult.valid) return applyValidationFeedback(validationResult);

		const loading = await loadingController.create({});
		await loading.present();
		const response = await data.submit();
		validationResult = getValidationResult(response);
		if (validationResult.valid) {
			data.config.completed?.({ actions, model: data.model, response: response.data });
			setModel(getObjectFromSchema(data.config.schema));
		} else {
			data.config.failed?.(validationResult);
			applyValidationFeedback(validationResult);
		}
		await loading.dismiss();
	}

	function applyCustomValidationFeedback(element: HTMLElement, message: string): void {
		const item = element.closest('ion-item');
		item?.style.setProperty('--border-color', 'var(--highlight-color-invalid)');
		const label = item?.querySelector('ion-label');
		if (label) {
			label.style.setProperty('--color', 'var(--ion-color-danger)');
		} else {
			item?.style.setProperty('--color', 'var(--ion-color-danger)');
		}
		const ionItem = document.createElement('ion-item');
		ionItem.dataset.error = 'true';
		ionItem.style.setProperty('--min-height', '0');
		const div = document.createElement('ion-note');
		div.style.setProperty('--color', 'var(--ion-color-danger)');
		div.textContent = message;
		ionItem.append(div);
		item?.after(ionItem);
	}

	function addListener<T extends Event>(
		element: HTMLElement | HTMLIonInputElement | HTMLIonTextareaElement,
		event: string,
		_function: (_event: T) => void,
		options?: AddEventListenerOptions | boolean
	): void {
		element.addEventListener(event, _function as EventListener, options);
		teardowns.push(() => element.removeEventListener(event, _function as EventListener, options));
	}

	function destroy(): void {
		for (const teardown of teardowns) teardown();
		for (const icon of passwordIcons) icon.remove();
	}

	return {
		destroy
	};
}

async function validate<T>(schema: ObjectSchema<AnyObject, T>, data: T): Promise<ValidationResult<T>> {
	try {
		await schema.validate(data, { abortEarly: false });
		return { valid: true };
	} catch (error) {
		let errors: CustomValidationError<T>[] = [];
		if (error instanceof ValidationError) {
			errors = error.inner
				.map(
					(error_) =>
						({
							field: error_.path?.split('.')?.[0],
							message: error_.message
						}) as CustomValidationError<T>
				)
				.toReversed()
				.filter((item, index, array) => array.findIndex((t) => t.field === item.field) === index);
		}
		return { errors, valid: false };
	}
}

function isIonInputElement(element: HTMLIonInputElement | HTMLIonTextareaElement): element is HTMLIonInputElement {
	return 'type' in element;
}
