import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child</div>` }));

describe('widgets/ionic/CustomItem', () => {
	it('handles click without sliding', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked, name: 'n1' }
		});
		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);
		expect(clicked).toHaveBeenCalledTimes(1);
	});

	it('shows icon, note and end-icon and triggers end click', async () => {
		const iconClicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, icon: 'start', iconClicked, iconEnd: 'end', note: 'N' }
		});
		expect(container.querySelector('ion-icon[slot="start"]')).toBeTruthy();
		expect(container.querySelector('ion-note')).toBeTruthy();
		const endButton = container.querySelector('ion-button[slot="end"]')!;
		await fireEvent.click(endButton);
		expect(iconClicked).toHaveBeenCalled();
	});

	it('opens sliding options when slidingOptions provided', async () => {
		const optionHandler = vi.fn();
		const { container } = render(CustomItem, {
			props: {
				children,
				slidingOptions: [{ color: 'danger', handler: optionHandler, icon: 'trash' }]
			}
		});
		const itemSliding = container.querySelector('ion-item-sliding') as HTMLIonItemSlidingElement;
		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);
		expect(itemSliding.open).toHaveBeenCalledWith('end');
		const option = container.querySelector('ion-item-option')!;
		await fireEvent.click(option);
		expect(optionHandler).toHaveBeenCalled();
	});

	it('triggers clicked on Enter key press', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked }
		});
		const item = container.querySelector('ion-item')!;
		await fireEvent.keyDown(item, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
	});

	it('does not trigger clicked on Enter when readonly', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked, readonly: true }
		});
		const item = container.querySelector('ion-item')!;
		await fireEvent.keyDown(item, { key: 'Enter' });
		expect(clicked).not.toHaveBeenCalled();
	});

	it('triggers clicked on Enter key in end button', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked, iconEnd: 'arrow' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]')!;
		await fireEvent.keyDown(endButton, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
	});

	it('renders with badge', () => {
		const { container } = render(CustomItem, {
			props: { badge: '5', badgeColor: 'warning', children }
		});
		const badge = container.querySelector('ion-badge');
		expect(badge).toBeTruthy();
		expect(badge?.textContent?.trim()).toBe('5');
		expect(badge?.getAttribute('color')).toBe('warning');
	});

	it('renders with transparent style', () => {
		const { container } = render(CustomItem, {
			props: { children, transparent: true }
		});
		const item = container.querySelector('ion-item');
		expect(item?.dataset.transparent).toBe('true');
	});

	it('renders with card style', () => {
		const { container } = render(CustomItem, {
			props: { card: true, children }
		});
		const item = container.querySelector('ion-item');
		expect(item?.dataset.card).toBe('true');
	});

	it('renders sliding option with label', () => {
		const handler = vi.fn();
		const { container } = render(CustomItem, {
			props: {
				children,
				slidingOptions: [{ handler, icon: 'trash', label: 'Delete' }]
			}
		});
		const label = container.querySelector('ion-item-option ion-text');
		expect(label?.textContent).toBe('Delete');
	});

	it('renders hidden when hidden prop is true', () => {
		const { container } = render(CustomItem, {
			props: { children, hidden: true }
		});
		const hiddenElement = container.querySelector('.hidden');
		expect(hiddenElement).toBeTruthy();
	});
});
