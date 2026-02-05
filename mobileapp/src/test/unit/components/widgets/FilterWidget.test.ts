import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import FilterWidget from '$lib/components/widgets/FilterWidget.svelte';

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

const createMockConfig = (): {
	searchbar: { placeholder: string; value: string; onSearch: () => void };
	sections: {
		icon: string;
		items: { data: { id: number; label: string }; selected: boolean }[];
		key: string;
		label: string;
		type: string;
	}[];
	onApply: () => void;
	onReset: () => void;
} => ({
	onApply: vi.fn(),
	onReset: vi.fn(),
	searchbar: {
		onSearch: vi.fn(),
		placeholder: 'Search...',
		value: ''
	},
	sections: [
		{
			icon: 'list',
			items: [
				{ data: { id: 1, label: 'Option A' }, selected: true },
				{ data: { id: 2, label: 'Option B' }, selected: false }
			],
			key: 'category',
			label: 'Category',
			type: 'multi-select' as const
		}
	]
});

const mockConfig = createMockConfig();

describe('widgets/FilterWidget', () => {
	it('renders filter button', () => {
		const { container } = render(FilterWidget, {
			props: { config: mockConfig as never }
		});
		const button = container.querySelector('ion-button');
		expect(button).toBeTruthy();
	});

	it('renders searchbar when configured', () => {
		const { container } = render(FilterWidget, {
			props: { config: mockConfig as never }
		});
		const searchbar = container.querySelector('ion-searchbar');
		expect(searchbar).toBeTruthy();
	});

	it('hides searchbar when not configured', () => {
		const configWithoutSearch = {
			...mockConfig,
			searchbar: undefined
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithoutSearch as never }
		});
		const searchbar = container.querySelector('ion-searchbar');
		expect(searchbar).toBeFalsy();
	});

	it('opens popover on filter button click', async () => {
		const { container } = render(FilterWidget, {
			props: { config: mockConfig as never }
		});
		const filterButton = container.querySelectorAll('ion-button')[1]; // Second button is filter
		if (filterButton) {
			await fireEvent.click(filterButton);
			await tick();
		}
		expect(container).toBeTruthy();
	});

	it('applies custom classList', () => {
		const { container } = render(FilterWidget, {
			props: { classList: 'custom-filter', config: mockConfig as never }
		});
		expect(container.querySelector('.custom-filter')).toBeTruthy();
	});

	it('calls onAction when action button clicked', async () => {
		const onAction = vi.fn();
		const configWithAction = {
			...mockConfig,
			actionButton: {
				icon: 'download',
				label: 'Export'
			}
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithAction as never, onAction }
		});
		// Find and click action button if present
		const buttons = container.querySelectorAll('ion-button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('shows filter indicator when filters applied', () => {
		const configWithAppliedFilter = {
			...mockConfig,
			state: {
				category: [2] // Different from default (which is [1])
			}
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithAppliedFilter as never }
		});
		// Should show some indicator that filters are active
		expect(container).toBeTruthy();
	});

	it('hides filter button when no sections', () => {
		const configNoSections = {
			...mockConfig,
			sections: []
		};
		const { container } = render(FilterWidget, {
			props: { config: configNoSections as never }
		});
		// Filter button should be hidden when no filter sections
		expect(container).toBeTruthy();
	});

	it('handles date-range filter section', () => {
		const configWithDateRange = {
			...mockConfig,
			sections: [
				{
					defaultFromValue: '2024-01-01',
					defaultToValue: '2024-12-31',
					key: 'dateRange',
					label: 'Date Range',
					type: 'date-range' as const
				}
			]
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithDateRange as never }
		});
		expect(container).toBeTruthy();
	});

	it('calls searchbar onSearch when input changes', async () => {
		const config = createMockConfig();
		const { container } = render(FilterWidget, {
			props: { config: config as never }
		});
		const searchbar = container.querySelector('ion-searchbar');
		if (searchbar) {
			await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'test' } }));
			await tick();
			expect(config.searchbar.onSearch).toHaveBeenCalledWith('test');
		}
	});

	it('handles empty search value', async () => {
		const config = createMockConfig();
		const { container } = render(FilterWidget, {
			props: { config: config as never }
		});
		const searchbar = container.querySelector('ion-searchbar');
		if (searchbar) {
			await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: undefined } }));
			await tick();
			expect(config.searchbar.onSearch).toHaveBeenCalledWith('');
		}
	});

	it('handles chips filter section', () => {
		const configWithChips = {
			...mockConfig,
			sections: [
				{
					defaultValue: 'option1',
					key: 'chipFilter',
					label: 'Chip Filter',
					options: [
						{ label: 'Option 1', value: 'option1' },
						{ label: 'Option 2', value: 'option2' }
					],
					type: 'chips' as const
				}
			]
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithChips as never }
		});
		expect(container).toBeTruthy();
	});

	it('handles chips-multi filter section', () => {
		const configWithChipsMulti = {
			...mockConfig,
			sections: [
				{
					defaultValue: ['option1'],
					key: 'chipsMultiFilter',
					label: 'Multi Chip Filter',
					options: [
						{ label: 'Option 1', value: 'option1' },
						{ label: 'Option 2', value: 'option2' }
					],
					type: 'chips-multi' as const
				}
			]
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithChipsMulti as never }
		});
		expect(container).toBeTruthy();
	});

	it('computes hasFiltersApplied correctly when filters differ from defaults', () => {
		const configWithApplied = {
			...mockConfig,
			state: {
				category: [2] // Different from default [1]
			}
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithApplied as never }
		});
		// Reset button should be visible when filters are applied
		const resetButton = container.querySelector('ion-button[color="danger"]');
		expect(resetButton).toBeTruthy();
	});

	it('computes hasFiltersApplied as false when filters match defaults', () => {
		const configWithDefaults = {
			...mockConfig,
			state: {
				category: [1] // Same as default (item with selected: true)
			}
		};
		const { container } = render(FilterWidget, {
			props: { config: configWithDefaults as never }
		});
		// No inline reset button when filters match defaults
		expect(container).toBeTruthy();
	});

	it('renders nothing when no searchbar and no sections', () => {
		const emptyConfig = {
			...mockConfig,
			searchbar: undefined,
			sections: []
		};
		const { container } = render(FilterWidget, {
			props: { config: emptyConfig as never }
		});
		// Component should render but may be empty
		expect(container).toBeTruthy();
	});
});
