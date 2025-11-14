import { type Locale as DateFnsLocale, de, enUS } from 'date-fns/locale';
import { type AnyObject, ObjectSchema } from 'yup';

import { Locale } from '$lib/locales';

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
 * Triggers a click event on an element with a specific label
 * @param label label of the element to click
 */
export async function triggerClickByLabel(label: string): Promise<void> {
	const element =
		[...document.querySelectorAll('ion-label')].find((element) => element.textContent === label)?.closest('ion-item') ??
		[...document.querySelectorAll('ion-card')].find((element) => element.id === label) ??
		[...document.querySelectorAll('ion-fab')]
			.find((element) => element.ariaLabel === label)
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
