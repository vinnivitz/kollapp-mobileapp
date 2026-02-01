import { loadingController } from '@ionic/core';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { type AnyObject, type ObjectSchema, ValidationError } from 'yup';

import {
	type ValidationError as CustomValidationError,
	Form,
	type FormActions,
	type ValidationResult
} from '$lib/models/ui';
import { getValidationResult } from '$lib/utility';

/**
 * Creates a custom form with validation and feedback
 * @param node form element
 * @param data form data
 * @returns {destroy} function to remove the event listeners
 */
export function customForm<T, R>(node: HTMLFormElement, data: Form<T, R>): { destroy(): void } {
	let dirty = false;
	let isSubmitting = false;
	const ionInputs = [...node.querySelectorAll('ion-input'), ...node.querySelectorAll('ion-textarea')];
	const ionInputFields = new Map<keyof T, HTMLIonInputElement | HTMLIonTextareaElement>();
	for (const input of ionInputs) {
		ionInputFields.set(input.name as keyof T, input);
	}
	const formInputs = [...node.querySelectorAll('[data-name]')] as HTMLElement[];
	let keys = Object.keys(data.model as object) as Array<keyof T>;
	const passwordIcons = new Map<HTMLIonInputElement, HTMLIonIconElement>();
	const listeners: Array<() => void> = [];
	const actions: FormActions<T> = { patchByKey, set };

	data.config.actions?.(actions);
	node.noValidate = true;

	setupKeyEventHandlers();
	initializeHiddenFields();
	initializeInputs();

	addListener(node, 'ionInput', (event: CustomEvent) => {
		const key = getKey(event);
		const value = event.detail.value as unknown;
		if (key && keys.includes(key)) {
			onInput(key, value);
		}
	});

	addListener(node, 'ionBlur', async (event: CustomEvent) => {
		const key = getKey(event);
		if (key && keys.includes(key)) {
			data.config.onBlur?.({ key, value: data.model[key] });
		}
	});

	addListener(node, 'submit', onSubmit);

	function getKey(event: CustomEvent): keyof T | undefined {
		return (
			isIonInputElement(event.target as Element)
				? (event.target as HTMLIonInputElement | HTMLIonTextareaElement).name
				: event.detail?.key
		) as keyof T | undefined;
	}

	function setupKeyEventHandlers(): void {
		if (!data.config.keyEventHandlers) return;

		for (const key of Object.keys(data.config.keyEventHandlers) as Array<keyof T>) {
			const handlers = data.config.keyEventHandlers[key];
			const input = ionInputFields.get(key);
			if (handlers && input) {
				addListener(input, 'keydown', (event) => {
					const keyboardEvent = event as KeyboardEvent;
					const handler = handlers[keyboardEvent.key];
					if (handler) {
						keyboardEvent.preventDefault();
						handler(data.model[key], onUpdate.bind(undefined, key));
					}
				});
			}
		}
	}

	function initializeHiddenFields(): void {
		if (!data.config.hiddenFields) return;

		for (const key of Object.keys(data.config.hiddenFields) as Array<keyof T>) {
			data.model[key] = data.config.hiddenFields[key] as T[keyof T];
		}
	}

	function initializeInputs(): void {
		for (const input of ionInputs) {
			initializeIonInput(input);
		}

		for (const input of formInputs) {
			initializeFormInput(input);
		}
	}

	function initializeIonInput(input: HTMLIonInputElement | HTMLIonTextareaElement): void {
		input.classList.add('ion-touched');
		const key = input.name as keyof T;
		const value = data.model[key];
		const formatter = data.config.formatters?.[key];

		input.value = formatter ? formatter(value) : ((value ?? '') as string);

		if (isIonInputElement(input) && input.type === 'password') {
			input.clearOnEdit = false;
			addPasswordIcon(input);
		}
	}

	function initializeFormInput(customInput: HTMLElement): void {
		const key = customInput.dataset.name as keyof T;
		if (key) {
			customInput.dispatchEvent(
				new CustomEvent('formUpdate', {
					bubbles: true,
					detail: { value: data.model[key] }
				})
			);
		}
	}

	function addPasswordIcon(input: HTMLIonInputElement): void {
		if (passwordIcons.has(input)) return;

		const existingIcon = input.nextElementSibling;
		if (existingIcon?.tagName === 'ION-ICON' && existingIcon.getAttribute('slot') === 'end') {
			existingIcon.remove();
		}

		const icon = document.createElement('ion-icon') as HTMLIonIconElement;
		icon.setAttribute('slot', 'end');
		icon.setAttribute('icon', eyeOutline);
		icon.classList.add('invisible');
		input.after(icon);

		const inputHandler = (event: CustomEvent): boolean =>
			icon.classList.toggle('invisible', (event.target as HTMLInputElement).value?.length === 0);
		const clickHandler = (): void => {
			input.type = input.type === 'password' ? 'text' : 'password';
			icon.setAttribute('icon', input.type === 'password' ? eyeOutline : eyeOffOutline);
		};

		addListener(input, 'input', inputHandler);
		addListener(icon, 'click', clickHandler);
		passwordIcons.set(input, icon);
	}

	function set(model?: T): void {
		data.model = model ?? data.config.schema.getDefault();
		keys = Object.keys(data.model as object) as Array<keyof T>;

		resetInputValidations();

		for (const input of ionInputs) {
			if (isIonInputElement(input) && (input.type === 'password' || input.type === 'text')) {
				const icon = input.nextElementSibling as HTMLIonIconElement;
				if (icon?.tagName === 'ION-ICON' && icon.getAttribute('slot') === 'end') {
					icon.classList.toggle('invisible', !input.value);
				}
			}
		}

		for (const input of formInputs) {
			removeCustomValidationFeedback(input);
			const key = input.dataset.name as keyof T;
			if (key) {
				input.dispatchEvent(
					new CustomEvent('formUpdate', {
						bubbles: true,
						detail: { value: data.model[key] }
					})
				);
			}
		}
	}

	async function patchByKey(key: keyof T, value: T[keyof T]): Promise<void> {
		data.model[key as keyof T] = value as T[keyof T];

		const input = ionInputFields.get(key);

		if (input) {
			updateNativeInput(input, key, value);
		} else {
			updateCustomInput(key, value);
		}

		data.config.onInput?.({ key, value: data.model[key] });

		if (dirty) {
			const validationResult = await runValidators();
			applyValidationFeedbackByKey(key, validationResult);
		}

		onTouched();
	}

	function updateNativeInput(
		input: HTMLIonInputElement | HTMLIonTextareaElement,
		key: keyof T,
		value: T[keyof T]
	): void {
		if (typeof value === 'string') {
			const formatter = data.config.formatters?.[key as keyof T];
			const formattedValue = formatter ? formatter(value) : value;
			input.value = formattedValue;
		}
	}

	function updateCustomInput(key: keyof T, value: T[keyof T]): void {
		const customInput = formInputs.find((ci) => ci.dataset.name === key);
		if (customInput) {
			customInput.dispatchEvent(
				new CustomEvent('formUpdate', {
					bubbles: true,
					detail: { value }
				})
			);
		}
	}

	function resetInputValidations(): void {
		for (const input of ionInputs) {
			input.classList.remove('ion-invalid');
			input.errorText = '';
			const key = input.name as keyof T;
			const value = data.model[key];
			const formatter = data.config.formatters?.[key];
			if (formatter && value !== undefined) {
				input.value = formatter(value) as string;
			} else if (typeof value === 'string') {
				input.value = value;
			} else {
				input.value = value == undefined ? '' : String(value);
			}
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
		data.model[key as keyof T] = value;
		const input = ionInputFields.get(key);
		if (input) {
			const formatter = data.config.formatters?.[key as keyof T];
			const formatted = formatter ? formatter(value) : ((value ?? '') as string);
			input.value = formatted;
		}

		if (dirty) {
			const validationResult = await runValidators();
			applyValidationFeedbackByKey(key, validationResult);
		}

		onTouched();
	}

	function getMessageForKey(result: ValidationResult<T>, key: keyof T): string | undefined {
		return result.errors?.find((error) => error.field === key)?.message;
	}

	function setNativeInputFeedback(input: HTMLIonInputElement | HTMLIonTextareaElement, message?: string): void {
		if (message) {
			input.classList.add('ion-invalid');
			input.errorText = message;
		} else {
			input.classList.remove('ion-invalid');
			input.errorText = '';
		}
	}

	function setCustomInputFeedback(customInput: HTMLElement, message?: string): void {
		removeCustomValidationFeedback(customInput);
		if (message) {
			applyCustomValidationFeedback(customInput, message);
		}
	}

	function applyValidationFeedback(result: ValidationResult<T>): void {
		for (const input of ionInputs) {
			applyValidationFeedbackByKey(input.name as keyof T, result);
		}
		for (const input of formInputs) {
			applyValidationFeedbackByKey(input.dataset.name as keyof T, result);
		}
	}

	function applyValidationFeedbackByKey(key: keyof T, result: ValidationResult<T>): void {
		const input = ionInputFields.get(key);
		const message = getMessageForKey(result, key);

		if (input) {
			setNativeInputFeedback(input, message);
		} else {
			const customInput = formInputs.find((input) => input.dataset.name === key);
			if (customInput) setCustomInputFeedback(customInput, message);
		}
	}

	async function runValidators(): Promise<ValidationResult<T>> {
		const validationResult = await validate(data.config.schema, data.model);
		if (!data.config.validators) {
			return validationResult;
		}

		for (const key of Object.keys(data.config.validators) as Array<keyof T>) {
			const validator = data.config.validators[key];
			if (validator) {
				const result = await validator(data.model);
				if (!result.valid) {
					validationResult.errors = [...(validationResult.errors ?? []), ...(result.errors ?? [])];
					validationResult.valid = false;
				}
			}
		}
		return validationResult;
	}

	function onInput(key: keyof T, value: unknown): void {
		const parser = data.config.parsers?.[key as keyof T];
		const parsed = (parser ? parser(value) : value) as T[keyof T];
		onUpdate(key, parsed);
		data.config.onInput?.({ key, value: parsed });
	}

	async function validateForm(): Promise<ValidationResult<T>> {
		let validationResult = await validate(data.config.schema, data.model);
		if (data.config.validators) {
			validationResult = await runValidators();
		}
		return validationResult;
	}

	async function onSubmit(event?: Event): Promise<void> {
		dirty = true;
		event?.preventDefault();

		if (isSubmitting) return;

		const validationResult = await validateForm();
		if (!validationResult.valid) {
			return applyValidationFeedback(validationResult);
		}
		isSubmitting = true;
		const loading = await loadingController.create({});
		await loading.present();

		try {
			const response = await data.submit();
			const validationResult = getValidationResult<T, R>(response);

			if (validationResult.valid) {
				data.config.completed?.({ actions, model: data.model, response: response.data });
				if (data.config.resetOnSubmit) {
					set(data.config.schema.getDefault());
				}
			} else {
				data.config.failed?.(validationResult);
				applyValidationFeedback(validationResult);
			}
		} finally {
			await loading.dismiss();
			isSubmitting = false;
		}
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
		listeners.push(() => element.removeEventListener(event, _function as EventListener, options));
	}

	function destroy(): void {
		for (const teardown of listeners) teardown();

		for (const icon of passwordIcons.values()) icon.remove();

		for (const input of formInputs) {
			removeCustomValidationFeedback(input);
		}

		if (data.config.actions) {
			const emptyActions: FormActions<T> = {
				patchByKey: async () => {},
				set: () => {}
			};
			data.config.actions(emptyActions);
		}
	}

	return {
		destroy
	};
}

async function validate<T>(schema: ObjectSchema<T & AnyObject>, data: T): Promise<ValidationResult<T>> {
	try {
		await schema.validate(data, { abortEarly: false });
		return { valid: true };
	} catch (error) {
		let errors: CustomValidationError<T>[] = [];
		if (error instanceof ValidationError) {
			const seen = new Set<keyof T>();
			errors = error.inner
				.map(
					(error_) =>
						({
							field: error_.path?.split('.')?.[0] as keyof T,
							message: error_.message
						}) satisfies CustomValidationError<T>
				)
				.filter((item) => {
					if (item.field) {
						if (seen.has(item.field)) return false;
						seen.add(item.field);
					}
					return true;
				});
		}
		return { errors, valid: false };
	}
}

function isIonInputElement(element?: Element): element is HTMLIonInputElement {
	return element?.tagName === 'ION-INPUT';
}
