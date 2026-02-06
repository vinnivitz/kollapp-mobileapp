import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import CustomItem from '$lib/components/core/form/CustomItem.svelte';

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

	it('renders with custom color', () => {
		const { container } = render(CustomItem, {
			props: { children, color: 'primary' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.getAttribute('color')).toBe('primary');
	});

	it('renders with iconColor prop', () => {
		const { container } = render(CustomItem, {
			props: { children, icon: 'star', iconColor: 'danger' }
		});
		const icon = container.querySelector('ion-icon[slot="start"]');
		expect(icon?.getAttribute('color')).toBe('danger');
	});

	it('renders disabled item', () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked, disabled: true }
		});
		const item = container.querySelector('ion-item');
		expect(item?.hasAttribute('disabled')).toBe(true);
	});

	it('renders with indexLabel as id', () => {
		const { container } = render(CustomItem, {
			props: { children, indexLabel: 'step-1' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.getAttribute('id')).toBe('step-1');
	});

	it('renders with custom classList', () => {
		const { container } = render(CustomItem, {
			props: { children, classList: 'my-custom-class' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.classList.contains('my-custom-class')).toBe(true);
	});

	it('renders with badgeEnd', () => {
		const { container } = render(CustomItem, {
			props: { badgeEnd: '99+', children }
		});
		const badge = container.querySelector('ion-badge[slot="end"]');
		expect(badge).toBeTruthy();
		expect(badge?.textContent?.trim()).toBe('99+');
	});

	it('renders with ariaLabel', () => {
		const { container } = render(CustomItem, {
			props: { ariaLabel: 'Custom action', children }
		});
		const item = container.querySelector('ion-item');
		expect(item?.getAttribute('aria-label')).toBe('Custom action');
	});

	it('does not trigger clicked on non-Enter key', async () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked }
		});
		const item = container.querySelector('ion-item')!;
		await fireEvent.keyDown(item, { key: 'Space' });
		expect(clicked).not.toHaveBeenCalled();
	});

	it('shows detail arrow when clicked is provided and not readonly', () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked }
		});
		const item = container.querySelector('ion-item');
		expect(item?.hasAttribute('detail')).toBe(true);
	});

	it('does not show detail arrow when iconEnd is provided', () => {
		const clicked = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, clicked, iconEnd: 'arrow' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.getAttribute('detail')).toBe('false');
	});
});
