import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

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

	it('renders start icon when provided and sets icon color to medium if item color is light', () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'light' as const,
			icon: 'start-icon'
		};
		const { container } = render(CustomItem, { props: properties });

		const startIcon = container.querySelector('ion-icon[slot="start"]');
		expect(startIcon).toBeTruthy();
		expect(startIcon?.getAttribute('icon')).toBe(properties.icon);
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

		expect(endButton).toBeTruthy();
		expect(endIcon).toBeTruthy();
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

		expect(ionItem).toBeTruthy();
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
				clicked: clickMock
			}
		});
		const ionItem = container.querySelector('ion-item') as HTMLIonItemElement;

		expect(ionItem).toBeTruthy();

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

		expect(iconButton).toBeTruthy();

		await fireEvent.click(iconButton);
		expect(iconClickMock).toHaveBeenCalled();
	});

	it('sets icon color to medium if item color is light or white else to white', () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'light' as const,
			icon: 'start-icon' as const
		};
		const { container } = render(CustomItem, { props: properties });

		const startIcon = container.querySelector('ion-icon[slot="start"]');
		expect(startIcon).toBeTruthy();
		expect(startIcon?.getAttribute('icon')).toBe(properties.icon);
		expect(startIcon?.getAttribute('color')).toBe('medium');

		const properties2 = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'white' as const,
			icon: 'start-icon' as const
		};
		const { container: container2 } = render(CustomItem, { props: properties2 });
		const startIcon2 = container2.querySelector('ion-icon[slot="start"]');

		expect(startIcon2).toBeTruthy();
		expect(startIcon2?.getAttribute('icon')).toBe(properties2.icon);
		expect(startIcon2?.getAttribute('color')).toBe('medium');

		const properties3 = {
			children: createRawSnippet(() => ({
				render: () => `<p>Test content</p>`
			})),
			color: 'dark' as const,
			icon: 'start-icon' as const
		};
		const { container: container3 } = render(CustomItem, { props: properties3 });
		const startIcon3 = container3.querySelector('ion-icon[slot="start"]');

		expect(startIcon3).toBeTruthy();
		expect(startIcon3?.getAttribute('icon')).toBe(properties3.icon);
		expect(startIcon3?.getAttribute('color')).toBe('white');
	});

	it('opens sliding options on item click when slidingOptions are provided and calls option handler', async () => {
		const handler = vi.fn();

		const { container } = render(CustomItem, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Swipe me</p>` })),
				// also pass a clicked to ensure it is NOT called in this branch
				clicked: vi.fn(),
				slidingOptions: [{ color: 'danger', handler, icon: 'trash' }]
			}
		});

		const sliding = container.querySelector('ion-item-sliding') as HTMLElement;
		const ionItem = container.querySelector('ion-item') as HTMLElement;
		expect(sliding).toBeTruthy();
		expect(ionItem).toBeTruthy();

		// Stub the .open method that the component calls through bind:this
		const openMock = vi.fn();
		(sliding as HTMLIonItemSlidingElement).open = openMock;

		// Clicking the item should open the sliding options (not call clicked)
		await fireEvent.click(ionItem);
		expect(openMock).toHaveBeenCalledWith('end');

		// The option should render with right color+icon and call its handler on click
		const option = container.querySelector('ion-item-option[color="danger"]') as HTMLElement;
		expect(option).toBeTruthy();

		const optionIcon = option.querySelector('ion-icon') as HTMLElement;
		expect(optionIcon).toBeTruthy();
		expect(optionIcon.getAttribute('icon')).toBe('trash');

		await fireEvent.click(option);
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('invokes clicked on Enter keydown on the item (no slidingOptions), ignores other keys', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Key me</p>` })),
				clicked
			}
		});

		const ionItem = container.querySelector('ion-item') as HTMLElement;

		await fireEvent.keyDown(ionItem, { key: ' ' });
		expect(clicked).not.toHaveBeenCalled();

		await fireEvent.keyDown(ionItem, { key: 'Enter' });
		expect(clicked).toHaveBeenCalledTimes(1);
	});

	it('pressing Enter on end icon button triggers clicked (not iconClick)', async () => {
		const clicked = vi.fn();
		const iconClick = vi.fn();

		const { container } = render(CustomItem, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>End icon</p>` })),
				clicked,
				iconClick,
				iconEnd: 'chevron-forward'
			}
		});

		const endButton = container.querySelector('ion-button[slot="end"]') as HTMLElement;
		expect(endButton).toBeTruthy();

		await fireEvent.keyDown(endButton, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
		expect(iconClick).not.toHaveBeenCalled();

		await fireEvent.click(endButton);
		expect(iconClick).toHaveBeenCalledTimes(1);
	});
});
