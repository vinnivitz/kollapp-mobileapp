import type { QuickAccessItemModel } from '$lib/models/ui';

import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuickAccessItem } from '$lib/components/widgets/quick-access';

class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		// Immediately trigger visibility
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Mock useSortable - ref needs to be a function for {@attach ref}
vi.mock('@dnd-kit-svelte/svelte/sortable', () => ({
	useSortable: () => ({
		isDragging: { current: false },
		ref: () => {} // ref is a function for the @attach directive
	})
}));

const defaultItem: QuickAccessItemModel = {
	icon: 'homeOutline',
	id: 'test-item-1',
	label: 'Test Item',
	route: '/' as never,
	widgetType: 'normal'
};

describe('widgets/quick-access/QuickAccessItem', () => {
	let onClick: () => void;
	let onPointerDown: () => void;
	let onPointerUp: () => void;
	let onRemove: () => void;

	beforeEach(() => {
		onClick = vi.fn();
		onPointerDown = vi.fn();
		onPointerUp = vi.fn();
		onRemove = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders the item with label', () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		expect(container.textContent).toContain('Test Item');
	});

	it('calls onClick when card is clicked in non-edit mode', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		// Click on the card element inside the wrapper (Card component renders first child)
		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		const cardElement = wrapper.firstElementChild as HTMLElement;
		await fireEvent.click(cardElement);

		expect(onClick).toHaveBeenCalledWith(defaultItem);
	});

	it('does not call onClick when card is clicked in edit mode', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: true,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		// Click on the card element inside the wrapper
		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		const cardElement = wrapper.firstElementChild as HTMLElement;
		await fireEvent.click(cardElement);

		expect(onClick).not.toHaveBeenCalled();
	});

	it('shows remove button in edit mode', () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: true,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		// In edit mode, the remove button should be rendered
		const wrapper = container.querySelector('.quick-access-item');
		expect(wrapper?.querySelectorAll('[color="danger"]').length).toBeGreaterThan(0);
	});

	it('does not show remove button in non-edit mode', () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		// In non-edit mode, no remove button should be visible
		const wrapper = container.querySelector('.quick-access-item');
		expect(wrapper?.querySelectorAll('[color="danger"]').length).toBe(0);
	});

	it('calls onRemove when remove button is clicked', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: true,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const removeButton = container.querySelector('[color="danger"]') as HTMLElement;
		await fireEvent.click(removeButton);

		expect(onRemove).toHaveBeenCalledWith('test-item-1');
	});

	it('calls onPointerDown when pointer is pressed', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		await fireEvent.pointerDown(wrapper);

		expect(onPointerDown).toHaveBeenCalled();
	});

	it('calls onPointerUp when pointer is released', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		await fireEvent.pointerUp(wrapper);

		expect(onPointerUp).toHaveBeenCalled();
	});

	it('calls onPointerUp when pointer leaves element', async () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		await fireEvent.pointerLeave(wrapper);

		expect(onPointerUp).toHaveBeenCalled();
	});

	it('applies wiggle class in edit mode', () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: true,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		expect(wrapper.classList.contains('wiggle')).toBe(true);
	});

	it('does not apply wiggle class when not in edit mode', () => {
		const { container } = render(QuickAccessItem, {
			props: {
				editMode: false,
				index: 0,
				item: defaultItem,
				onClick,
				onPointerDown,
				onPointerUp,
				onRemove
			}
		});

		const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
		expect(wrapper.classList.contains('wiggle')).toBe(false);
	});

	describe('special item types', () => {
		it('renders item with special widgetType', () => {
			const specialItem: QuickAccessItemModel = {
				...defaultItem,
				specialWidgetId: 'budget-chart-card',
				widgetType: 'special'
			};

			const { container } = render(QuickAccessItem, {
				props: {
					editMode: false,
					index: 0,
					item: specialItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			expect(container.querySelector('.quick-access-item')).toBeTruthy();
		});

		it('renders item with add widgetType', () => {
			const addItem: QuickAccessItemModel = {
				...defaultItem,
				widgetType: 'normal'
			};

			const { container } = render(QuickAccessItem, {
				props: {
					editMode: false,
					index: 0,
					item: addItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			expect(container.querySelector('.quick-access-item')).toBeTruthy();
		});
	});

	describe('isOverlay prop', () => {
		it('renders with isOverlay true', () => {
			const { container } = render(QuickAccessItem, {
				props: {
					editMode: true,
					index: 0,
					isOverlay: true,
					item: defaultItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			const wrapper = container.querySelector('.quick-access-item') as HTMLElement;
			expect(wrapper).toBeTruthy();
		});

		it('renders with isOverlay false (default)', () => {
			const { container } = render(QuickAccessItem, {
				props: {
					editMode: false,
					index: 0,
					item: defaultItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			expect(container.querySelector('.quick-access-item')).toBeTruthy();
		});
	});

	describe('labels', () => {
		it('renders long labels', () => {
			const longLabelItem: QuickAccessItemModel = {
				...defaultItem,
				label: 'This is a very long label that should be truncated'
			};

			const { container } = render(QuickAccessItem, {
				props: {
					editMode: false,
					index: 0,
					item: longLabelItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			expect(container.textContent).toContain('This is a very long label');
		});

		it('renders empty label', () => {
			const emptyLabelItem: QuickAccessItemModel = {
				...defaultItem,
				label: ''
			};

			const { container } = render(QuickAccessItem, {
				props: {
					editMode: false,
					index: 0,
					item: emptyLabelItem,
					onClick,
					onPointerDown,
					onPointerUp,
					onRemove
				}
			});

			expect(container.querySelector('.quick-access-item')).toBeTruthy();
		});
	});
});
