import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import GlobalPopovers from '$lib/components/widgets/ionic/GlobalPopovers.svelte';

describe('widgets/ionic/GlobalPopovers', () => {
	it('renders popover and handles didDismiss', async () => {
		const { container } = render(GlobalPopovers);
		const pop = container.querySelector('ion-popover')!;
		expect(pop).toBeTruthy();
		await fireEvent(pop, new CustomEvent('didDismiss'));
	});
});
