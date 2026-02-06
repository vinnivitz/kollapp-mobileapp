import type { MultiSelectItem } from '$lib/models/ui';

import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MultiSelectInputItem from '$lib/components/core/form/MultiSelectInputItem.svelte';

describe('widgets/ionic/MultiSelectInputItem', () => {
	const items: MultiSelectItem[] = [
		{ color: 'primary', data: { id: 1, label: 'One' }, selected: false },
		{ color: 'secondary', data: { id: 2, label: 'Two' }, selected: false }
	];

	const itemsWithIcon: MultiSelectItem[] = [
		{ color: 'primary', data: { id: 1, label: 'One' }, icon: 'star', selected: false },
		{ color: 'secondary', data: { id: 2, label: 'Two' }, icon: 'heart', selected: true }
	];

	it('opens modal, filters, toggles and confirms (multiple)', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectInputItem, {
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
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: false, value: [2] }
		});
		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);
		const radioOption = container.querySelector('ion-radio') as HTMLIonRadioElement;
		await fireEvent.click(radioOption);
		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);
		expect(changed).toHaveBeenCalledWith([expect.any(Number)]);
	});

	it('displays all selected text when all items selected', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', multiple: true, value: [1, 2] }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toBeTruthy();
	});

	it('displays none selected text when no items selected', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', multiple: true, value: [] }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toBeTruthy();
	});

	it('displays comma-separated labels when some items selected', () => {
		const threeItems: MultiSelectItem[] = [
			{ color: 'primary', data: { id: 1, label: 'Alpha' }, selected: false },
			{ color: 'secondary', data: { id: 2, label: 'Beta' }, selected: false },
			{ color: 'tertiary', data: { id: 3, label: 'Gamma' }, selected: false }
		];
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: threeItems, label: 'Select', multiple: true, value: [1, 2] }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toContain('Alpha');
		expect(displayText?.textContent).toContain('Beta');
	});

	it('dismisses modal and resets draft selection', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: true, value: [1] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		// Toggle an item
		const checkbox = container.querySelector('ion-checkbox') as HTMLIonCheckboxElement;
		await fireEvent(checkbox, new CustomEvent('ionChange'));

		// Dismiss
		const dismissButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		if (dismissButton) await fireEvent.click(dismissButton);

		expect(changed).not.toHaveBeenCalled();
	});

	it('toggles item selection via checkbox', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: true, value: [] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const checkboxes = container.querySelectorAll('ion-checkbox');
		await fireEvent(checkboxes[0]!, new CustomEvent('ionChange'));
		await fireEvent(checkboxes[1]!, new CustomEvent('ionChange'));

		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);

		expect(changed).toHaveBeenCalledWith([1, 2]);
	});

	it('deselects all with toggle', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: true, value: [1, 2] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const selectAll = container.querySelector('ion-toggle') as HTMLIonToggleElement;
		await fireEvent(selectAll, new CustomEvent('ionChange', { detail: { checked: false } }));

		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);

		expect(changed).toHaveBeenCalledWith([]);
	});

	it('renders with disabled prop', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { disabled: true, icon: 'list', items, label: 'Select' }
		});

		const item = container.querySelector('ion-item');
		expect(item?.hasAttribute('disabled')).toBe(true);
	});

	it('renders with hidden prop', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { hidden: true, icon: 'list', items, label: 'Select' }
		});

		const div = container.querySelector('div.hidden');
		expect(div).toBeTruthy();
	});

	it('renders without search when search=false', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', search: false }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const searchbar = container.querySelector('ion-searchbar');
		expect(searchbar).toBeFalsy();
	});

	it('renders items with icons in multiple mode', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: itemsWithIcon, label: 'Select', multiple: true, value: [] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const icons = container.querySelectorAll('ion-list ion-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('renders items with icons in single mode', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: itemsWithIcon, label: 'Select', multiple: false, value: [] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const icons = container.querySelectorAll('ion-radio-group ion-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('uses first selected item as default in single mode', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: itemsWithIcon, label: 'Select', multiple: false, value: [] }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toContain('Two'); // The one with selected: true
	});

	it('single select with no value shows none selected', () => {
		const noSelectedItems: MultiSelectItem[] = [
			{ color: 'primary', data: { id: 1, label: 'One' }, selected: false },
			{ color: 'secondary', data: { id: 2, label: 'Two' }, selected: false }
		];
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: noSelectedItems, label: 'Select', multiple: false, value: [] }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toBeTruthy();
	});

	it('dismisses single select and resets selectedId', async () => {
		const changed = vi.fn();
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items, label: 'Select', multiple: false, value: [1] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		// Select different item
		const radios = container.querySelectorAll('ion-radio');
		await fireEvent.click(radios[1]!);

		// Dismiss
		const dismissButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		if (dismissButton) await fireEvent.click(dismissButton);

		expect(changed).not.toHaveBeenCalled();
	});

	it('confirms single select with undefined selectedId', async () => {
		const changed = vi.fn();
		const noSelectedItems: MultiSelectItem[] = [{ color: 'primary', data: { id: 1, label: 'One' }, selected: false }];
		const { container } = render(MultiSelectInputItem, {
			props: { changed, icon: 'list', items: noSelectedItems, label: 'Select', multiple: false, value: [] }
		});

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);

		expect(changed).toHaveBeenCalledWith([]);
	});

	it('renders with readonly prop', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', readonly: true }
		});

		const item = container.querySelector('ion-item');
		expect(item).toBeTruthy();
	});

	it('renders with custom classList', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { classList: 'custom-select', icon: 'list', items, label: 'Select' }
		});

		const item = container.querySelector('ion-item.custom-select');
		expect(item).toBeTruthy();
	});

	it('dispatches ionInput event when name is set (multiple)', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', multiple: true, name: 'mySelect' }
		});

		const rootDiv = container.querySelector('div[data-name="mySelect"]') as HTMLDivElement;
		const events: CustomEvent[] = [];
		rootDiv.addEventListener('ionInput', ((_event: Event) => events.push(_event as CustomEvent)) as EventListener);

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const checkboxes = container.querySelectorAll('ion-checkbox');
		await fireEvent(checkboxes[0]!, new CustomEvent('ionChange'));

		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);

		expect(events.length).toBe(1);
		expect(events[0]!.detail.key).toBe('mySelect');
	});

	it('dispatches ionInput event when name is set (single)', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items, label: 'Select', multiple: false, name: 'mySelect' }
		});

		const rootDiv = container.querySelector('div[data-name="mySelect"]') as HTMLDivElement;
		const events: CustomEvent[] = [];
		rootDiv.addEventListener('ionInput', ((_event: Event) => events.push(_event as CustomEvent)) as EventListener);

		await fireEvent.click(container.querySelector('ion-item') as HTMLIonItemElement);

		const radio = container.querySelector('ion-radio');
		await fireEvent.click(radio!);

		const confirm = container.querySelector('ion-buttons[slot="end"] ion-button');
		if (confirm) await fireEvent.click(confirm);

		expect(events.length).toBe(1);
		expect(events[0]!.detail.key).toBe('mySelect');
	});
});
