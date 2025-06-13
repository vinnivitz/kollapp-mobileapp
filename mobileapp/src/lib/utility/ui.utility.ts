import type { ValidationError as CustomValidationError, Form, FormActions, ValidationResult } from '$lib/models/ui';

import { type Locale as DateFnsLocale, de, enUS } from 'date-fns/locale';
import { eye, eyeOff } from 'ionicons/icons';
import { get, writable } from 'svelte/store';
import { type AnyObject, ObjectSchema, ValidationError } from 'yup';

import { Locale, t } from '$lib/locales';

const $t = get(t);

/**
 * Creates a clickable element with a ripple effect
 * @param node node to attach the click event to
 * @param callback callback to execute on click
 * @returns {destroy} function to remove the event listener
 */
export function clickableElement<T>(
	node: HTMLElement,
	callback: (value?: Event) => Promise<T> | T
): { destroy(): void } {
	function onClick(): void {
		callback();
	}

	node.setAttribute('role', 'button');
	node.setAttribute('tabindex', '0');
	node.addEventListener('click', onClick);
	node.classList.add('relative', 'ion-activatable', 'ripple-parent', 'rectangle');
	node.append(document.createElement('ion-ripple-effect'));

	return {
		destroy(): void {
			node.removeEventListener('click', onClick);
		}
	};
}

/**
 * Triggers a click event on an element with a specific label
 * @param label label of the element to click
 */
export async function triggerClickByLabel(label: string): Promise<void> {
	const element =
		[...document.querySelectorAll('ion-label')].find((element) => element.textContent === label)?.closest('ion-item') ??
		[...document.querySelectorAll('ion-card')].find((element) => element.id === label) ??
		[...document.querySelectorAll('ion-fab')]
			.find((element) => element.id === label)
			?.querySelector('ion-fab-button') ??
		[...document.querySelectorAll('ion-label')]
			.find((element) => element.textContent === label)
			?.closest('ion-segment-button');
	setTimeout(() => element?.click(), 10);
}

/**
 * Apply this directive to any element to detect click outside of that element.
 * @param node node to apply the directive to
 * @returns {object} The directive
 */
export function clickOutside(node: Node): { destroy: () => void } {
	const handleClick = (event: Event): void => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('blur', node as object));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

/**
 * Gets the date-fns locale for a given locale
 * @param locale Locale to get the date-fns locale for
 * @returns DateFnsLocale for the given locale
 */
export function getDateFnsLocale(locale: Locale | undefined): DateFnsLocale {
	switch (locale) {
		case Locale.DE: {
			return de;
		}
		case Locale.EN: {
			return enUS;
		}
		default: {
			return enUS;
		}
	}
}

/**
 * Creates a custom form with validation and feedback
 * @param node form element
 * @param data form data
 * @returns {destroy} function to remove the event listeners
 */
export function customForm<T>(node: HTMLFormElement, data: Form<T>): { destroy(): void } {
	const ionFormActions = writable<FormActions>();
	let dirty = false;
	const inputs = [...node.querySelectorAll('ion-input'), ...node.querySelectorAll('ion-textarea')];
	const customInputs = [...node.querySelectorAll('[data-name]')] as HTMLElement[];
	const keys = Object.keys(data.model as object);
	const passwordIcons: HTMLIonIconElement[] = [];

	if (data.config.exposedActions) {
		data.config.exposedActions({
			applyValidationFeedback,
			applyValidationFeedbackByKey,
			onSubmit,
			onUpdate,
			resetModel
		});
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

	node.addEventListener('ionInput', async (event) => {
		const input = event.target as HTMLInputElement;
		if (input && keys.includes(input.name)) {
			await onChange(event);
		}
	});

	node.addEventListener('ionBlur', async (event) => {
		if (data.config?.onBlur) {
			data.config.onBlur((event.target as HTMLInputElement).name as keyof T);
		}
	});

	node.noValidate = true;
	node.addEventListener('submit', onSubmit);

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

	function resetModel(clear = false): void {
		data.model = (clear ? {} : data.config.schema.cast({})) as T;
		for (const input of inputs) {
			input.classList.remove('ion-invalid');
			input.errorText = '';
			input.value = clear ? '' : (data.model[input.name as keyof T] as string);
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
		if (data.config.onTouched) {
			data.config.onTouched();
		}
	}

	async function onUpdate(key: keyof T, value: T[keyof T]): Promise<void> {
		const formatter = data.config.formatters?.[key as keyof T];
		if (formatter) {
			const input = inputs.find((input) => input.name === key);
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

	function applyValidationFeedback(result: ValidationResult): void {
		for (const input of inputs) {
			applyValidationFeedbackByKey(input.name as keyof T, result);
		}
		for (const input of customInputs) {
			applyValidationFeedbackByKey(input.dataset.name as keyof T, result);
		}
	}

	function applyValidationFeedbackByKey(key: keyof T, result: ValidationResult): void {
		const input = inputs.find((input) => input.name === key);
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

	async function runCustomValidators(validationResult: ValidationResult): Promise<ValidationResult> {
		for (const validator of data.config.customValidators || []) {
			const result = await validator(data.model);
			if (!result.valid) {
				validationResult.errors = [...(validationResult.errors || []), ...(result.errors || [])];
				validationResult.valid = false;
			}
		}
		return validationResult;
	}

	async function onChange(event: Event): Promise<void> {
		const key = (event.target as HTMLInputElement).name as keyof T;
		const value = (event.target as HTMLInputElement).value as T[keyof T];
		const parser = data.config.parser?.[key as keyof T];
		await (parser ? _onUpdate(key, await parser(value)) : _onUpdate(key, value as T[keyof T]));
		if (data.config.onChange) {
			data.config.onChange(key, value);
		}
	}

	async function onSubmit(event?: Event): Promise<void> {
		dirty = true;
		event?.preventDefault();
		let validationResult: ValidationResult = { valid: true };
		if (data.config.schema) {
			validationResult = await validate(data.config.schema, data.model);
			if (data.config.customValidators) {
				validationResult = await runCustomValidators(validationResult);
			}
			applyValidationFeedback(validationResult);
		}
		if (data.config.onSubmit) {
			data.config.onSubmit(data.model, validationResult);
		}
	}

	function applyCustomValidationFeedback(element: HTMLElement, message: string): void {
		const item = element.closest('ion-item');
		if (item) {
			item.style.setProperty('--border-color', 'var(--highlight-color-invalid)');
			const label = item.querySelector('ion-label');
			if (label) {
				label.style.setProperty('--color', 'var(--ion-color-danger)');
			} else {
				item.style.setProperty('--color', 'var(--ion-color-danger)');
			}
			const ionItem = document.createElement('ion-item');
			ionItem.dataset.error = 'true';
			ionItem.style.setProperty('--min-height', '0');
			const div = document.createElement('ion-note');
			div.style.setProperty('--color', 'var(--ion-color-danger)');
			div.textContent = message;
			ionItem.append(div);
			item.after(ionItem);
		}
	}

	function destroy(): void {
		node.removeEventListener('ionInput', onChange);
		node.removeEventListener('submit', onSubmit);
		ionFormActions.set({
			applyValidationFeedback: () => {},
			applyValidationFeedbackByKey: () => {},
			onSubmit: () => {},
			onUpdate: () => {},
			resetModel: () => {}
		});
		for (const icon of passwordIcons) {
			icon.remove();
		}
	}

	return {
		destroy
	};
}

async function validate<T>(schema: ObjectSchema<AnyObject, T>, data: T): Promise<ValidationResult> {
	try {
		await schema.validate(data, { abortEarly: false });
		return { valid: true };
	} catch (error) {
		let errors: CustomValidationError[] = [{ field: 'error', message: $t('api.error') }];
		if (error instanceof ValidationError) {
			errors = error.inner
				.map(
					(error_) =>
						({
							field: error_.path?.split('.')?.[0],
							message: error_.message
						}) as CustomValidationError
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
