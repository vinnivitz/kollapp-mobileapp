import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';

describe('widgets/ionic/FabButton', () => {
	it('fires main click and renders list items', async () => {
		const clicked = vi.fn();
		const childHandler = vi.fn();
		const { container } = render(FabButton, {
			props: {
				buttons: [{ handler: childHandler, icon: 'a', label: 'A' }],
				clicked,
				icon: 'add'
			}
		});
		const main = container.querySelector('ion-fab-button:not([aria-label])')!;
		await fireEvent.click(main);
		expect(clicked).toHaveBeenCalled();
		const child = container.querySelector('ion-fab-list ion-fab-button')!;
		await fireEvent.click(child);
		expect(childHandler).toHaveBeenCalled();
	});
	it('Enter key triggers handlers for main and child buttons', async () => {
		const clicked = vi.fn();
		const childHandler = vi.fn();
		const { container } = render(FabButton, {
			props: { buttons: [{ handler: childHandler, icon: 'a', label: 'A' }], clicked, icon: 'add' }
		});
		const main = container.querySelector('ion-fab-button:not([aria-label])')!;
		await fireEvent.keyDown(main, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
		const child = container.querySelector('ion-fab-list ion-fab-button')!;
		await fireEvent.keyDown(child, { key: 'Enter' });
		expect(childHandler).toHaveBeenCalled();

		cleanup();
		const rendered2 = render(FabButton, { props: { clicked, icon: 'add' } });
		expect(rendered2.container.querySelector('ion-fab-list')).toBeNull();
	});
});
