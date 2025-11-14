import type { Readable } from 'svelte/store';

import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GlobalPopovers from '$lib/components/widgets/ionic/GlobalPopovers.svelte';
import { DateTimePickerType } from '$lib/models/ui';
import { globalPopoverStore } from '$lib/stores';

// Mock $lib/stores safely using importActual and create a writable inside factory
vi.mock('$lib/stores', async () => {
	const actual = await vi.importActual('$lib/stores');
	const s = await vi.importActual<{
		writable: (initial: unknown) => { subscribe: (run: (v: unknown) => void) => () => void };
	}>('svelte/store');
	const datetime = s.writable({ open: false, type: 'date', value: undefined });
	const localeStore = s.writable('en-US');
	return {
		...actual,
		globalPopoverStore: { datetimeInputItem: datetime },
		localeStore
	};
});

// eslint-disable-next-line unicorn/consistent-function-scoping
const emptyFunction = vi.hoisted(() => (): void => {});

// Mock locales to provide a minimal t store
vi.mock('$lib/locales', async () => {
	const s = await vi.importActual<{
		readable: (function_: (k: string) => string, stop: () => void) => Readable<string>;
	}>('svelte/store');
	const t = s.readable((k: string) => k, emptyFunction);
	return { t };
});

describe('GlobalPopovers', () => {
	beforeEach(() => {
		// reset to default closed state before each test
		globalPopoverStore.datetimeInputItem.set({ open: false, type: DateTimePickerType.DATE, value: undefined });
	});

	it('does not render Datetime when closed, Popover renders with extended class', () => {
		const { container } = render(GlobalPopovers);
		const popover = container.querySelector('ion-popover') as HTMLElement;
		expect(popover).toBeTruthy();
		expect(popover.classList.contains('extended')).toBe(true);
		// Popover is closed, so isOpen should be false
		expect(popover.getAttribute('is-open')).toBe('false');
		// Datetime is rendered but inside closed Popover
		expect(container.querySelector('ion-datetime')).toBeTruthy();
	});

	it('renders Datetime when open and passes props; applied and dismissed fire', async () => {
		const applied = vi.fn();
		const dismissed = vi.fn();
		const min = '2025-01-01';
		const max = '2026-12-31';
		const value = '2025-10-29';
		globalPopoverStore.datetimeInputItem.set({
			applied,
			dismissed,
			max,
			min,
			open: true,
			type: DateTimePickerType.TIME,
			value
		});

		const { container } = render(GlobalPopovers);
		const dt = container.querySelector('ion-datetime') as HTMLElement;
		expect(dt).toBeTruthy();
		// attribute reflection in jsdom
		expect(dt.getAttribute('value')).toBe(value);
		expect(dt.getAttribute('min')).toBe(min);
		expect(dt.getAttribute('max')).toBe(max);
		expect(dt.getAttribute('presentation')).toBe('time');

		// Simulate ionChange and blur to trigger applied/dismissed
		await fireEvent(dt, new CustomEvent('ionChange', { detail: { value } }));
		expect(applied).toHaveBeenCalledWith(value);

		await fireEvent.blur(dt);
		expect(dismissed).toHaveBeenCalled();
	});

	it('didDismiss on Popover closes the Datetime content (open -> false)', async () => {
		globalPopoverStore.datetimeInputItem.set({ open: true, type: DateTimePickerType.DATE });
		const { container } = render(GlobalPopovers);
		const popover = container.querySelector('ion-popover') as HTMLElement;
		expect(popover).toBeTruthy();
		// When open, Datetime is rendered inside
		expect(container.querySelector('ion-datetime')).toBeTruthy();
		// Popover should be open
		expect(popover.getAttribute('is-open')).toBe('true');

		await fireEvent(popover, new CustomEvent('didDismiss'));
		// After dismissal, Popover is closed but Datetime still exists in DOM
		expect(popover.getAttribute('is-open')).toBe('false');
		expect(container.querySelector('ion-datetime')).toBeTruthy();
	});
});
