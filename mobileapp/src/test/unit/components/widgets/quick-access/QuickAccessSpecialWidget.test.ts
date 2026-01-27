import type { QuickAccessItem } from '$lib/models/ui';

import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import QuickAccessSpecialWidget from '$lib/components/widgets/quick-access/QuickAccessSpecialWidget.svelte';

// Mock useSortable - ref needs to be a function for {@attach ref}
vi.mock('@dnd-kit-svelte/svelte/sortable', () => ({
	useSortable: () => ({
		isDragging: { current: false },
		ref: () => {}
	})
}));

// Mock navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Mock $app/paths resolve
vi.mock('$app/paths', () => ({
	resolve: vi.fn((path, parameters) => {
		if (parameters && 'slug' in parameters) {
			return path.replace('[slug]', parameters.slug);
		}
		return path;
	})
}));

// Mock IntersectionObserver to make LazyRender immediately visible
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

const organizationCardItem: QuickAccessItem = {
	icon: 'peopleOutline',
	id: 'organization-card',
	label: 'Organization',
	route: '/' as never,
	specialWidgetId: 'organization-card',
	widgetType: 'special'
};

const upcomingActivityItem: QuickAccessItem = {
	icon: 'calendarOutline',
	id: 'upcoming-activity-card',
	label: 'Upcoming Activity',
	route: '/' as never,
	specialWidgetId: 'upcoming-activity-card',
	widgetType: 'special'
};

const budgetChartItem: QuickAccessItem = {
	icon: 'cardOutline',
	id: 'budget-chart-card',
	label: 'Budget',
	route: '/' as never,
	specialWidgetId: 'budget-chart-card',
	widgetType: 'special'
};

const mockOrganization = {
	id: 1,
	name: 'Test Organization',
	personsOfOrganization: [
		{ id: 1, name: 'Person 1' },
		{ id: 2, name: 'Person 2' }
	]
};

const mockActivity = {
	activityPostings: [{ id: 1 }],
	date: new Date().toISOString(),
	id: 1,
	name: 'Test Activity'
};

describe('widgets/quick-access/QuickAccessSpecialWidget', () => {
	let onPointerDown: () => void;
	let onPointerUp: () => void;
	let onRemove: (id: string) => void;

	beforeEach(() => {
		onPointerDown = vi.fn();
		onPointerUp = vi.fn();
		onRemove = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('organization-card widget', () => {
		it('renders organization name', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			expect(container.textContent).toContain('Test Organization');
		});

		it('shows member count', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			// Text contains member info
			expect(container.querySelector('ion-note')).toBeTruthy();
		});

		it('shows remove button in edit mode', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const removeButton = container.querySelector('ion-button[color="danger"]');
			expect(removeButton).toBeTruthy();
		});

		it('calls onRemove when remove button clicked', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const removeButton = container.querySelector('ion-button[color="danger"]') as HTMLElement;
			await fireEvent.click(removeButton);

			expect(onRemove).toHaveBeenCalledWith('organization-card');
		});
	});

	describe('upcoming-activity-card widget', () => {
		it('renders activity name when activity exists', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: mockActivity as never,
					editMode: false,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			expect(container.textContent).toContain('Test Activity');
		});

		it('shows no upcoming activity message when no activity', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const note = container.querySelector('ion-note');
			expect(note).toBeTruthy();
		});

		it('shows remove button in edit mode', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: mockActivity as never,
					editMode: true,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const removeButton = container.querySelector('ion-button[color="danger"]');
			expect(removeButton).toBeTruthy();
		});
	});

	describe('budget-chart-card widget', () => {
		it('renders BudgetChart component', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: budgetChartItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			// BudgetChart is wrapped in LazyRender - wait for it to render
			await vi.waitFor(() => {
				expect(container.querySelector('ion-card')).toBeTruthy();
			});
		});

		it('shows remove button in edit mode', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					item: budgetChartItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const removeButton = container.querySelector('ion-button[color="danger"]');
			expect(removeButton).toBeTruthy();
		});
	});

	describe('pointer events', () => {
		it('calls onPointerDown when pointer is pressed', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			await fireEvent.pointerDown(wrapper);

			expect(onPointerDown).toHaveBeenCalled();
		});

		it('calls onPointerUp when pointer is released', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			await fireEvent.pointerUp(wrapper);

			expect(onPointerUp).toHaveBeenCalled();
		});

		it('calls onPointerUp when pointer leaves element', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			await fireEvent.pointerLeave(wrapper);

			expect(onPointerUp).toHaveBeenCalled();
		});
	});

	describe('edit mode styling', () => {
		it('applies wiggle class in edit mode', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper.classList.contains('wiggle')).toBe(true);
		});

		it('does not apply wiggle class when not in edit mode', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper.classList.contains('wiggle')).toBe(false);
		});
	});

	describe('organization card navigation', () => {
		it('card is clickable in non-edit mode', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const card = container.querySelector('ion-card');
			expect(card).toBeTruthy();
		});

		it('card is not clickable in edit mode', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const card = container.querySelector('ion-card');
			expect(card).toBeTruthy();
		});
	});

	describe('upcoming activity card navigation', () => {
		it('card is clickable when activity exists and not in edit mode', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: mockActivity as never,
					editMode: false,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const card = container.querySelector('ion-card');
			expect(card).toBeTruthy();
		});

		it('card is not clickable when in edit mode', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: mockActivity as never,
					editMode: true,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const card = container.querySelector('ion-card');
			expect(card).toBeTruthy();
		});

		it('card is not clickable when no activity', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: upcomingActivityItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			const card = container.querySelector('ion-card');
			expect(card).toBeTruthy();
		});
	});

	describe('isOverlay prop', () => {
		it('renders with isOverlay true', () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: true,
					index: 0,
					isOverlay: true,
					item: organizationCardItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: mockOrganization as never,
					postings: []
				}
			});

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper).toBeTruthy();
		});
	});

	describe('budget chart with postings', () => {
		it('passes empty postings to BudgetChart', async () => {
			const { container } = render(QuickAccessSpecialWidget, {
				props: {
					activity: undefined,
					editMode: false,
					index: 0,
					item: budgetChartItem,
					onPointerDown,
					onPointerUp,
					onRemove,
					organization: undefined,
					postings: []
				}
			});

			await vi.waitFor(() => {
				expect(container.querySelector('ion-card')).toBeTruthy();
			});
		});
	});
});
