import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ToggleItem from '$lib/components/core/form/ToggleItem.svelte';

describe('widgets/ionic/ToggleItem', () => {
	it('propagates ionChange to changed callback', async () => {
		const changed = vi.fn();
		const { container } = render(ToggleItem, { props: { changed, checked: false, label: 'On/Off' } });
		const toggle = container.querySelector('ion-toggle') as HTMLIonToggleElement;
		await fireEvent(toggle, new CustomEvent('ionChange', { detail: { checked: true } }));
		expect(changed).toHaveBeenCalledWith(true);
	});
});
