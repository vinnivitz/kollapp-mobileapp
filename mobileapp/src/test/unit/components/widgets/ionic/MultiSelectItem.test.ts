import type { SelectItem } from '$lib/models/ui';

import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MultiSelectItem from '$lib/components/widgets/ionic/MultiSelectItem.svelte';

describe('widgets/ionic/MultiSelectItem', () => {
	const items: SelectItem[] = [
		{ color: 'primary', data: { id: 1, label: 'One' }, selected: false },
		{ color: 'secondary', data: { id: 2, label: 'Two' }, selected: false }
	];

	it('opens modal, filters, toggles and confirms (multiple)', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: true, value: [1] }
		});
		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);
		expect(container.querySelector('ion-modal')).toBeTruthy();
		const sb = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		await fireEvent(sb, new CustomEvent('ionInput', { detail: { value: 'Tw' } }));
		const selectAll = container.querySelector('ion-toggle') as HTMLIonToggleElement;
		await fireEvent(selectAll, new CustomEvent('ionChange', { detail: { checked: true } }));
		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);
		expect(changed).toHaveBeenCalled();
	});

	it('single select sets selectedId and confirms', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: false, value: [2] }
		});
		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);
		const radioOption = container.querySelector('ion-radio') as HTMLIonRadioElement;
		await fireEvent.click(radioOption);
		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);
		expect(changed).toHaveBeenCalledWith([expect.any(Number)]);
	});
});
