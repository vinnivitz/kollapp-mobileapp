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
		const iconClick = vi.fn();
		const { container } = render(CustomItem, {
			props: { children, icon: 'start', iconClick, iconEnd: 'end', note: 'N' }
		});
		expect(container.querySelector('ion-icon[slot="start"]')).toBeTruthy();
		expect(container.querySelector('ion-note')).toBeTruthy();
		const endButton = container.querySelector('ion-button[slot="end"]')!;
		await fireEvent.click(endButton);
		expect(iconClick).toHaveBeenCalled();
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
});
