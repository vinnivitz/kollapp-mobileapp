import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Popover from '$lib/components/core/feedback/Popover.svelte';

const children = createRawSnippet(() => ({ render: () => '<div>Popover Content</div>' }));

describe('widgets/ionic/Popover', () => {
	it('renders lazily and handles didDismiss', async () => {
		const dismissed = vi.fn();
		const { container, rerender } = render(Popover, {
			props: { children, dismissed, lazy: true, open: false }
		});
		expect(container.querySelector('ion-popover')).toBeFalsy();
		await rerender({ children, dismissed, lazy: true, open: true });
		const pop = container.querySelector('ion-popover') as HTMLIonPopoverElement;
		expect(pop).toBeTruthy();
		await fireEvent(pop, new CustomEvent('didDismiss'));
		expect(dismissed).toHaveBeenCalled();
	});
});
