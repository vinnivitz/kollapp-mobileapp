import type { ConfirmModalConfig } from '$lib/models/ui';
import type { OrganizationRole } from '@kollapp/api-types';
import type { AnyObject, ObjectSchema } from 'yup';

import { alertController } from '@ionic/core';
import { type Locale as DateFnsLocale, de, enUS } from 'date-fns/locale';
import { get } from 'svelte/store';

import { Locale, t } from '$lib/locales';

/**
 * Creates a clickable element with a ripple effect
 * @param node node to attach the click event to
 * @param callback callback to execute on click
 * @returns {destroy} function to remove the event listener
 */
export function clickableElement(node: HTMLElement, callback: () => void): { destroy(): void } {
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
 * Gets the role translation from the organization role
 * @param role organization role
 * @returns {string} role translation
 */
export function getRoleTranslationFromRole(role: OrganizationRole): string {
	const $t = get(t);
	switch (role) {
		case 'ROLE_ORGANIZATION_MANAGER': {
			return $t('utility.ui.get-role-translation.manager');
		}
		case 'ROLE_ORGANIZATION_MEMBER': {
			return $t('utility.ui.get-role-translation.member');
		}
		default: {
			return role;
		}
	}
}

/**
 * Triggers a click event on an element with a specific label
 * @param label label of the element to click
 */
export async function triggerClickByLabel(label: string): Promise<void> {
	label = label.replaceAll(/['"]/g, '').trim();
	const element =
		[...document.querySelectorAll('ion-label')]
			.find((element) => element.textContent.trim() === label)
			?.closest('ion-item') ??
		[...document.querySelectorAll('ion-card')].find((element) => element.id.trim() === label) ??
		[...document.querySelectorAll('ion-fab')]
			.find((element) => element.id.trim() === label)
			?.querySelector('ion-fab-button') ??
		[...document.querySelectorAll('ion-label')]
			.find((element) => element.textContent.trim() === label)
			?.closest('ion-segment-button') ??
		[...document.querySelectorAll('ion-button')].find((element) => element.textContent.trim() === label);
	setTimeout(() => element?.click(), 10);
}

/**
 * Directive that dispatches a custom 'clickoutside' event when the user clicks outside the node.
 * @param node node to apply the directive to
 * @param callback optional callback to call when clicked outside
 * @returns {object} The directive
 */
export function clickOutside(
	node: Node,
	callback?: () => void
): { destroy: () => void; update: (callback_?: () => void) => void } {
	const handleClick = (event: Event): void => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			callback?.();
			node.dispatchEvent(new CustomEvent('clickoutside', { detail: node }));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		},
		update(callback_?: () => void) {
			callback = callback_;
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
 * Appends an element to the body and returns a destroy function to remove it
 * @param element element to append to the body
 * @returns {destroy} function to remove the element from the body
 */
export function appendToBody(element: HTMLElement): { destroy(): void } | undefined {
	if (document.body.contains(element)) return;
	document.body.append(element);

	return {
		destroy(): void {
			if (document.body.contains(element)) {
				element.remove();
			}
		}
	};
}

/**
 * Debounces a function call
 * @param function_ function to debounce
 * @param delay delay in milliseconds
 * @returns debounced function
 */
export function debounce<F extends (...arguments_: unknown[]) => unknown>(
	function_: F,
	delay: number
): (...arguments_: Parameters<F>) => void {
	let timerId: NodeJS.Timeout | undefined;

	return (...arguments_: Parameters<F>) => {
		if (timerId !== undefined) {
			clearTimeout(timerId);
		}
		timerId = setTimeout(() => {
			function_(...arguments_);
			timerId = undefined;
		}, delay);
	};
}

/**
 * Gets an object from a schema with default values
 * @param schema schema to get the object from
 * @returns {ObjectSchema<AnyObject, T>} object with default values
 */
export function getObjectFromSchema<T>(schema: ObjectSchema<T & AnyObject>): T {
	return schema.getDefault() as T;
}

/** Clones a value deeply
 * @param value value to clone
 * @returns {T} cloned value
 */
export function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Displays a confirmation modal
 * @param header header of the modal
 * @param message message of the modal
 * @param handler handler to execute on confirm
 */
export async function confirmationModal(config: ConfirmModalConfig): Promise<void> {
	const $t = get(t);
	const alert = await alertController.create({
		buttons: [
			{ role: 'cancel', text: $t('utility.ui.confirm-modal.cancel') },
			{
				handler: async () => await config.handler(),
				text: config.confirmText ?? $t('utility.ui.confirm-modal.confirm')
			}
		],
		header: config.header ?? $t('utility.ui.confirm-modal.header'),
		message: config.message ?? $t('utility.ui.confirm-modal.message')
	});
	await alert.present();
}

/**
 * Displays an information modal
 * @param header header of the modal
 * @param message message of the modal
 */
export async function informationModal(header: string, message: string): Promise<void> {
	const $t = get(t);
	const alert = await alertController.create({
		buttons: [{ role: 'confirm', text: $t('utility.ui.information-modal.ok') }],
		cssClass: 'whitespace-pre-line',
		header,
		message,
		translucent: true
	});
	await alert.present();
	await alert.onDidDismiss();
}
