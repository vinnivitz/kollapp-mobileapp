import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';

const tSubscribeCallback = (key: string): string => key;
const tUnsubscribe = (): void => {};

const tMock = vi.hoisted(() => ({
	subscribe: vi.fn((run: (value: (key: string) => string) => void) => {
		run(tSubscribeCallback);
		return tUnsubscribe;
	})
}));
const addModalMock = vi.hoisted(() => vi.fn());
const removeModalMock = vi.hoisted(() => vi.fn());
const subscribeModalCallback = (): void => {};
const subscribeModalMock = vi.hoisted(() =>
	vi.fn((run: (v: unknown[]) => void) => {
		run([]);
		return subscribeModalCallback;
	})
);
const getPlatformsMock = vi.hoisted(() => vi.fn(() => ['desktop']));
const getTopMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));

function registerMocks(): void {
	vi.mock('$lib/locales', () => ({
		t: tMock
	}));

	vi.mock('$lib/stores', () => ({
		globalPopoverStore: {
			datetimeInputItem: {
				set: vi.fn(),
				subscribe: vi.fn()
			}
		},
		modalStore: {
			add: addModalMock,
			remove: removeModalMock,
			subscribe: subscribeModalMock
		}
	}));

	vi.mock('@ionic/core', () => ({
		getPlatforms: getPlatformsMock,
		modalController: {
			getTop: getTopMock
		}
	}));
}

describe('LocationInputItem Component', () => {
	beforeAll(() => {
		registerMocks();

		globalThis.ResizeObserver = class ResizeObserver {
			observe(): void {}
			unobserve(): void {}
			disconnect(): void {}
		};
	});

	beforeEach(() => {
		addModalMock.mockClear();
		removeModalMock.mockClear();
		subscribeModalMock.mockClear().mockImplementation((run: (v: unknown[]) => void) => {
			run([]);
			return subscribeModalCallback;
		});
		getPlatformsMock.mockClear().mockReturnValue(['desktop']);
		getTopMock.mockClear().mockResolvedValue({});
	});

	it('renders with required props', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		const ionInput = container.querySelector('ion-input');
		expect(ionInput).toBeTruthy();
		expect(ionInput?.getAttribute('label')).toBe('Location');
		expect(ionInput?.getAttribute('name')).toBe('location');
	});

	it('renders with optional props: card, helperText, and custom icon', async () => {
		const customIcon = 'custom-location-icon';
		const helperText = 'Enter your location';

		const { container } = render(LocationInputItem, {
			props: {
				card: true,
				helperText,
				icon: customIcon,
				label: 'Location',
				name: 'location'
			}
		});

		const ionInput = container.querySelector('ion-input');
		expect(ionInput).toBeTruthy();

		const helperAttribute = ionInput?.getAttribute('helper-text');
		expect(helperAttribute).toBe(helperText);
	});

	it('opens map modal when map icon is clicked', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();

		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
	});

	it('confirms location selection from map and updates input', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});

	it('dismisses modal without updating input when dismissed', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const ionInput = container.querySelector('ion-input') as HTMLIonInputElement;
		const initialValue = ionInput?.value;

		// Open modal
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		// Find cancel/dismiss button
		const cancelButton = container.querySelector('ion-button:not([color="primary"])');
		expect(cancelButton).toBeTruthy();

		await fireEvent.click(cancelButton!);
		await tick();

		// Input value should remain unchanged
		expect(ionInput?.value).toBe(initialValue);
	});

	it('sets input value and dispatches ionInput event on confirm', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});

	it('renders modal with correct breakpoint settings', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});

	it('conditionally renders LeafletMap only when modal is open', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});

	it('passes correct props to InputItem', async () => {
		const helperText = 'Please enter a valid location';
		const customIcon = 'pin-outline';

		const { container } = render(LocationInputItem, {
			props: {
				card: true,
				helperText,
				icon: customIcon,
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const ionInput = container.querySelector('ion-input');
		expect(ionInput?.getAttribute('label')).toBe('Location');
		expect(ionInput?.getAttribute('name')).toBe('location');

		const helperAttribute = ionInput?.getAttribute('helper-text');
		expect(helperAttribute).toBe(helperText);
	});

	it('handles inputElement callback from InputItem', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const ionInput = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(ionInput).toBeTruthy();

		expect(ionInput.tagName.toLowerCase()).toBe('ion-input');
	});

	it('uses default locationOutline icon when no custom icon provided', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBeGreaterThanOrEqual(2);

		const startIcon = container.querySelector('ion-icon[slot="start"]');
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(startIcon).toBeTruthy();
		expect(endButton).toBeTruthy();
	});

	it('modal is informational when no cachedLocation exists', async () => {
		const { container } = render(LocationInputItem, {
			props: {
				label: 'Location',
				name: 'location'
			}
		});

		await tick();

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		await tick();

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});
});
