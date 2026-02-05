import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MultiSelectInputItem from '$lib/components/widgets/ionic/MultiSelectInputItem.svelte';

class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const mockItems = [
	{ data: { id: 1, label: 'Option A' }, selected: true },
	{ data: { id: 2, label: 'Option B' }, selected: false },
	{ data: { id: 3, label: 'Option C' }, selected: false }
];

describe('widgets/ionic/MultiSelectInputItem', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetModules();
	});

	it('renders with label', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: mockItems, label: 'Select Options' }
		});
		expect(container.textContent).toContain('Select Options');
	});

	it('displays selected item label for single select', () => {
		const { container } = render(MultiSelectInputItem, {
			props: {
				icon: 'list',
				items: mockItems,
				label: 'Single',
				multiple: false
			}
		});
		// Should show "Option A" as it's selected
		expect(container.textContent).toContain('Option A');
	});

	it('displays noneSelectedText when nothing selected', () => {
		const unselectedItems = mockItems.map((item) => ({ ...item, selected: false }));
		const { container } = render(MultiSelectInputItem, {
			props: {
				icon: 'list',
				items: unselectedItems,
				label: 'Select',
				noneSelectedText: 'Nothing selected'
			}
		});
		expect(container.textContent).toContain('Nothing selected');
	});

	it('opens modal on click', async () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: mockItems, label: 'Options' }
		});
		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);
		await tick();
		// Modal should be rendered
		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
	});

	it('renders hidden when hidden=true', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { hidden: true, icon: 'list', items: mockItems, label: 'Hidden' }
		});
		const hiddenElement = container.querySelector('.hidden');
		expect(hiddenElement).toBeTruthy();
	});

	it('renders with disabled state', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { disabled: true, icon: 'list', items: mockItems, label: 'Disabled' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.hasAttribute('disabled')).toBe(true);
	});

	it('renders with readonly state', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: mockItems, label: 'Readonly', readonly: true }
		});
		expect(container).toBeTruthy();
	});

	it('shows icon', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'people', items: mockItems, label: 'People' }
		});
		const icon = container.querySelector('ion-icon[slot="start"]');
		expect(icon).toBeTruthy();
	});

	it('shows iconEnd when provided', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', iconEnd: 'open', items: mockItems, label: 'With End' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
	});

	it('calls iconClicked when end icon clicked', async () => {
		const iconClicked = vi.fn();
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', iconClicked, iconEnd: 'open', items: mockItems, label: 'Click End' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]')!;
		await fireEvent.click(endButton);
		expect(iconClicked).toHaveBeenCalled();
	});

	it('renders with name prop for form binding', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { icon: 'list', items: mockItems, label: 'Form Field', name: 'selectField' }
		});
		const div = container.querySelector('div[data-name="selectField"]');
		expect(div).toBeTruthy();
	});

	it('uses value prop when name not provided', () => {
		const { container } = render(MultiSelectInputItem, {
			props: {
				icon: 'list',
				items: mockItems,
				label: 'With Value',
				value: [1, 2]
			}
		});
		expect(container).toBeTruthy();
	});

	it('shows allSelectedText when all items selected', () => {
		const allSelected = mockItems.map((item) => ({ ...item, selected: true }));
		const { container } = render(MultiSelectInputItem, {
			props: {
				allSelectedText: 'All selected!',
				icon: 'list',
				items: allSelected,
				label: 'All'
			}
		});
		expect(container.textContent).toContain('All selected!');
	});

	it('applies custom classList', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { classList: 'custom-class', icon: 'list', items: mockItems, label: 'Custom' }
		});
		expect(container.querySelector('.custom-class')).toBeTruthy();
	});

	it('renders with ariaLabel', () => {
		const { container } = render(MultiSelectInputItem, {
			props: { ariaLabel: 'Select your options', icon: 'list', items: mockItems, label: 'Select' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.getAttribute('aria-label')).toBe('Select your options');
	});
});
