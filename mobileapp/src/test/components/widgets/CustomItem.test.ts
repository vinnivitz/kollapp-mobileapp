import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import CustomItem from '$lib/components/widgets/CustomItem.svelte';

describe('ItemComponent', () => {
	it('renders children content', () => {
		const childText = 'Hello, world!';
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>${childText}</p>`
			}))
		};
		const { container } = render(CustomItem, { props: properties });
		const ionItem = container.querySelector('ion-item');
		expect(ionItem?.textContent).toContain(childText);
	});

	it('renders iconStart when provided and sets icon color to medium if item color is light', () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'light' as const,
			iconStart: 'start-icon'
		};
		const { container } = render(CustomItem, { props: properties });

		const startIcon = container.querySelector('ion-icon[slot="start"]');
		expect(startIcon).toBeDefined();
		expect(startIcon?.getAttribute('icon')).toBe(properties.iconStart);
		expect(startIcon?.getAttribute('color')).toBe('medium');
	});

	it('renders iconEnd when provided', () => {
		const properties = {
			children: createRawSnippet(() => ({ render: () => `<p>Test content</p>` })),
			iconEnd: 'end-icon'
		};
		const iconEnd = 'end-icon';
		const { container } = render(CustomItem, { props: properties });

		const endButton = container.querySelector('ion-button[slot="end"]');
		const endIcon = endButton?.querySelector('ion-icon[slot="icon-only"]');

		expect(endButton).toBeDefined();
		expect(endIcon).toBeDefined();
		expect(endIcon?.getAttribute('icon')).toBe(iconEnd);
		expect(endIcon?.getAttribute('size')).toBe('large');
	});

	it('sets data attributes based on props', () => {
		const { container } = render(CustomItem, {
			props: {
				card: true,
				children: createRawSnippet(() => ({
					render: () => `<p>Test content</p>`
				})),
				transparent: true
			}
		});
		const ionItem = container.querySelector('ion-item');

		expect(ionItem).toBeDefined();
		expect(ionItem?.getAttribute('data-card')).toBeTruthy();
		expect(ionItem?.getAttribute('data-transparent')).toBeTruthy();
	});

	it('calls the click callback when the item is clicked', async () => {
		const clickMock = vi.fn();
		const { container } = render(CustomItem, {
			props: {
				children: createRawSnippet(() => ({
					render: () => `<p>Clickable content</p>`
				})),
				click: clickMock
			}
		});
		const ionItem = container.querySelector('ion-item') as HTMLIonItemElement;

		expect(ionItem).toBeDefined();

		await fireEvent.click(ionItem);
		expect(clickMock).toHaveBeenCalled();
	});

	it('calls the iconClick callback when the end icon button is clicked', async () => {
		const iconClickMock = vi.fn();
		const iconEnd = 'end-icon';
		const { container } = render(CustomItem, {
			props: {
				children: createRawSnippet(() => ({
					render: () => `<p>Icon clickable content</p>`
				})),
				iconClick: iconClickMock,
				iconEnd
			}
		});
		const iconButton = container.querySelector('ion-button[slot="end"]') as HTMLIonButtonElement;

		expect(iconButton).toBeDefined();

		await fireEvent.click(iconButton);
		expect(iconClickMock).toHaveBeenCalled();
	});

	it('sets icon color to medium if item color is light or white else to white', () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'light' as const,
			iconStart: 'start-icon' as const
		};
		const { container } = render(CustomItem, { props: properties });

		const startIcon = container.querySelector('ion-icon[slot="start"]');
		expect(startIcon).toBeDefined();
		expect(startIcon?.getAttribute('icon')).toBe(properties.iconStart);
		expect(startIcon?.getAttribute('color')).toBe('medium');

		const properties2 = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'white' as const,
			iconStart: 'start-icon' as const
		};
		const { container: container2 } = render(CustomItem, { props: properties2 });
		const startIcon2 = container2.querySelector('ion-icon[slot="start"]');

		expect(startIcon2).toBeDefined();
		expect(startIcon2?.getAttribute('icon')).toBe(properties2.iconStart);
		expect(startIcon2?.getAttribute('color')).toBe('medium');

		const properties3 = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'dark' as const,
			iconStart: 'start-icon' as const
		};
		const { container: container3 } = render(CustomItem, { props: properties3 });
		const startIcon3 = container3.querySelector('ion-icon[slot="start"]');

		expect(startIcon3).toBeDefined();
		expect(startIcon3?.getAttribute('icon')).toBe(properties3.iconStart);
		expect(startIcon3?.getAttribute('color')).toBe('white');
	});
});
