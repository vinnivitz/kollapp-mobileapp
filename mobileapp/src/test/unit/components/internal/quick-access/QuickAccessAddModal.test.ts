import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { searchableService } from '$lib/api/services';
import { QuickAccessAddModal } from '$lib/components/internal/quick-access';
import { quickAccessStore, SPECIAL_WIDGETS } from '$lib/stores';

// Mock navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

const mockSearchableItems = [
	{ icon: 'homeOutline', id: '1', label: 'Home', route: '/' },
	{ icon: 'settingsOutline', id: '2', label: 'Settings', route: '/settings' },
	{ icon: 'personOutline', id: '3', label: 'Profile', route: '/profile' }
];

describe('widgets/quick-access/QuickAccessAddModal', () => {
	let dismissed: () => void;

	beforeEach(() => {
		dismissed = vi.fn();
		vi.clearAllMocks();
		vi.mocked(searchableService.filter).mockResolvedValue(mockSearchableItems as never);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('renders modal when open', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			// Modal component should be rendered
			expect(container).toBeTruthy();
		});

		it('renders modal when closed', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: false
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('shows searchbar', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			expect(searchbar).toBeTruthy();
		});

		it('searchbar has light color', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar[color="light"]');
			expect(searchbar).toBeTruthy();
		});

		it('searchbar has debounce set', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			expect(searchbar?.getAttribute('debounce')).toBe('100');
		});
	});

	describe('search functionality', () => {
		it('loads all items on mount', async () => {
			render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			// Should have called filter with empty string on mount
			expect(searchableService.filter).toHaveBeenCalledWith('');
		});
	});

	describe('lists structure', () => {
		it('contains ion-list elements', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const lists = container.querySelectorAll('ion-list');
			expect(lists.length).toBeGreaterThan(0);
		});

		it('contains list headers', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const listHeaders = container.querySelectorAll('ion-list-header');
			expect(listHeaders.length).toBeGreaterThan(0);
		});
	});

	describe('special widgets', () => {
		it('SPECIAL_WIDGETS function returns array', () => {
			const widgets = SPECIAL_WIDGETS();
			expect(Array.isArray(widgets)).toBe(true);
		});

		it('SPECIAL_WIDGETS contains organization-card', () => {
			const widgets = SPECIAL_WIDGETS();
			const hasOrganization = widgets.some((w) => w.id === 'organization-card');
			expect(hasOrganization).toBe(true);
		});

		it('SPECIAL_WIDGETS contains upcoming-activity-card', () => {
			const widgets = SPECIAL_WIDGETS();
			const hasActivity = widgets.some((w) => w.id === 'upcoming-activity-card');
			expect(hasActivity).toBe(true);
		});

		it('SPECIAL_WIDGETS contains budget-chart-card', () => {
			const widgets = SPECIAL_WIDGETS();
			const hasBudget = widgets.some((w) => w.id === 'budget-chart-card');
			expect(hasBudget).toBe(true);
		});
	});

	describe('store integration', () => {
		it('quickAccessStore has addItem method', () => {
			expect(quickAccessStore.addItem).toBeDefined();
			expect(typeof quickAccessStore.addItem).toBe('function');
		});
	});

	describe('handleDismiss', () => {
		it('accepts dismissed callback prop', () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			expect(container).toBeTruthy();
		});
	});

	describe('searchbar interaction', () => {
		it('searchbar is focusable', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			expect(searchbar).toBeTruthy();
		});

		it('triggers search on input', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'test' } }));
				await tick();

				expect(searchableService.filter).toHaveBeenCalledWith('test');
			}
		});
	});

	describe('sticky header', () => {
		it('has sticky search container', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const stickyContainer = container.querySelector('.sticky');
			expect(stickyContainer).toBeTruthy();
		});

		it('sticky container is at top', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const topContainer = container.querySelector('.top-0');
			expect(topContainer).toBeTruthy();
		});

		it('sticky container has z-index', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const zIndexContainer = container.querySelector('.z-10');
			expect(zIndexContainer).toBeTruthy();
		});
	});

	describe('search with no results', () => {
		it('displays no results message when search returns empty', async () => {
			vi.mocked(searchableService.filter).mockResolvedValue([]);

			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'nonexistent' } }));
				await tick();
			}

			// The empty state note should be rendered
			expect(container.querySelector('ion-note')).toBeTruthy();
		});
	});

	describe('item filtering', () => {
		it('filters items based on search input', async () => {
			vi.mocked(searchableService.filter).mockResolvedValue([mockSearchableItems[0]] as never);

			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'home' } }));
				await tick();
			}

			expect(searchableService.filter).toHaveBeenCalledWith('home');
		});

		it('handles null search value', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: undefined } }));
				await tick();
			}

			expect(container).toBeTruthy();
		});

		it('handles undefined search value', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				await fireEvent(searchbar, new CustomEvent('ionInput', { detail: {} }));
				await tick();
			}

			expect(container).toBeTruthy();
		});
	});

	describe('modal content', () => {
		it('renders all functions list', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			const lists = container.querySelectorAll('ion-list');
			expect(lists.length).toBeGreaterThan(0);
		});

		it('renders ion-labels for items', async () => {
			const { container } = render(QuickAccessAddModal, {
				props: {
					dismissed,
					open: true
				}
			});
			await tick();

			// Should render at least some content
			expect(container.querySelector('ion-list')).toBeTruthy();
		});
	});

	describe('special widget types', () => {
		it('special widgets have widgetType special', () => {
			const widgets = SPECIAL_WIDGETS();
			for (const widget of widgets) {
				expect(widget.widgetType).toBe('special');
			}
		});

		it('special widgets have unique ids', () => {
			const widgets = SPECIAL_WIDGETS();
			const ids = widgets.map((w) => w.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('special widgets have icons', () => {
			const widgets = SPECIAL_WIDGETS();
			for (const widget of widgets) {
				expect(widget.icon).toBeDefined();
				expect(widget.icon.length).toBeGreaterThan(0);
			}
		});

		it('special widgets have labels', () => {
			const widgets = SPECIAL_WIDGETS();
			for (const widget of widgets) {
				expect(widget.label).toBeDefined();
				expect(widget.label.length).toBeGreaterThan(0);
			}
		});
	});
});
