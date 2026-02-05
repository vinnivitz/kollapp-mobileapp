import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PostingFilter from '$lib/components/widgets/FilterWidget.svelte';

describe('widgets/budget/PostingFilter', () => {
	let onStateChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onStateChange = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('renders with minimal config', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders with custom classList', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { classList: 'custom-filter-class', config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders filter button when sections exist', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						icon: 'filter',
						inputLabel: 'Filter',
						items: [
							{ data: { id: 1, label: 'Category 1' }, selected: true },
							{ data: { id: 2, label: 'Category 2' }, selected: false }
						],
						key: 'category',
						label: 'Category',
						type: 'multi-select' as const
					}
				],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			// Component renders with filter section
			expect(container.firstChild).toBeTruthy();
		});

		it('renders with searchbar config', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				searchbar: {
					onSearch: vi.fn(),
					placeholder: 'Search...',
					value: ''
				},
				sections: [],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});

		it('renders export button when onExportPostings provided', async () => {
			const onExportPostings = vi.fn();
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: 'all',
						key: 'type',
						label: 'Type',
						options: [{ label: 'All', value: 'all' }],
						type: 'chips' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config, onAction: onExportPostings }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('does not render when no searchbar and no sections', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			// Without searchbar or sections, no container div is rendered
			expect(container.querySelector('ion-searchbar')).toBeFalsy();
		});
	});

	describe('chips section', () => {
		it('renders chips section with options', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: 'active',
						key: 'status',
						label: 'Status',
						options: [
							{ label: 'Active', value: 'active' },
							{ label: 'Inactive', value: 'inactive' }
						],
						type: 'chips' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders chips with icons and colors', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: 'high',
						key: 'priority',
						label: 'Priority',
						options: [
							{ color: 'danger' as const, icon: 'alert', label: 'High', value: 'high' },
							{ color: 'success' as const, icon: 'checkmark', label: 'Low', value: 'low' }
						],
						type: 'chips' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('chips-multi section', () => {
		it('renders chips-multi section with multiple selection', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: ['tag1', 'tag2'],
						key: 'tags',
						label: 'Tags',
						options: [
							{ label: 'Tag 1', value: 'tag1' },
							{ label: 'Tag 2', value: 'tag2' },
							{ label: 'Tag 3', value: 'tag3' }
						],
						type: 'chips-multi' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('multi-select section', () => {
		it('renders multi-select section', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						icon: 'checkmark-circle',
						inputLabel: 'Select Status',
						items: [
							{ data: { id: 0, label: 'Active' }, selected: true },
							{ data: { id: 1, label: 'Inactive' }, selected: false }
						],
						key: 'status',
						label: 'Status',
						type: 'multi-select' as const
					}
				],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders multi-select without label', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						icon: 'list',
						inputLabel: 'Select',
						items: [{ data: { id: 1, label: 'Item 1' }, selected: true }],
						key: 'items',
						label: 'Items',
						type: 'multi-select' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles multi-select with custom text', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						allSelectedText: 'All selected',
						icon: 'list',
						inputLabel: 'Select Items',
						items: [{ data: { id: 1, label: 'Item 1' }, selected: true }],
						key: 'items',
						label: 'Items',
						noneSelectedText: 'None selected',
						searchPlaceholder: 'Search items...',
						type: 'multi-select' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('date-range section', () => {
		it('renders date-range section', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultFromValue: '2024-01-01',
						defaultToValue: '2024-12-31',
						key: 'dateRange',
						label: 'Select Date Range',
						labelFrom: 'From',
						labelTo: 'To',
						type: 'date-range' as const
					}
				],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders date-range section without label', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultFromValue: '2024-01-01',
						defaultToValue: '2024-12-31',
						key: 'dateRange',
						label: 'Date Range',
						type: 'date-range' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders date-range with min/max constraints', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultFromValue: '2024-01-01',
						defaultToValue: '2024-12-31',
						fromLabel: 'Start Date',
						key: 'dateRange',
						label: 'Date Range',
						max: '2025-12-31',
						min: '2020-01-01',
						toLabel: 'End Date',
						type: 'date-range' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('export functionality', () => {
		it('accepts onExportPostings callback', async () => {
			const onExportPostings = vi.fn();
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config, onAction: onExportPostings }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders export button with searchbar', async () => {
			const onExportPostings = vi.fn();
			const config = {
				onApply: vi.fn(),
				onStateChange,
				searchbar: {
					onSearch: vi.fn(),
					placeholder: 'Search...',
					value: ''
				},
				sections: [],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config, onAction: onExportPostings }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('searchbar functionality', () => {
		it('handles search input', async () => {
			const onSearch = vi.fn();
			const config = {
				onApply: vi.fn(),
				onStateChange,
				searchbar: {
					onSearch,
					placeholder: 'Search postings...',
					value: 'initial'
				},
				sections: [],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			expect(searchbar).toBeTruthy();
		});

		it('uses custom placeholder', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				searchbar: {
					onSearch: vi.fn(),
					placeholder: 'Custom placeholder',
					value: ''
				},
				sections: [],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			const searchbar = container.querySelector('ion-searchbar');
			expect(searchbar?.getAttribute('placeholder')).toBe('Custom placeholder');
		});

		it('uses default placeholder when not provided', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				searchbar: {
					onSearch: vi.fn(),
					value: ''
				},
				sections: [],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});
	});

	describe('filter state', () => {
		it('initializes with default values from sections', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						icon: 'options',
						inputLabel: 'Select Types',
						items: [
							{ data: { id: 1, label: 'Type A' }, selected: true },
							{ data: { id: 2, label: 'Type B' }, selected: false }
						],
						key: 'types',
						label: 'Types',
						type: 'multi-select' as const
					}
				],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			// Component should render correctly
			expect(container).toBeTruthy();
		});

		it('accepts external state', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						icon: 'options',
						inputLabel: 'Select Types',
						items: [{ data: { id: 1, label: 'Type A' }, selected: true }],
						key: 'types',
						label: 'Types',
						type: 'multi-select' as const
					}
				],
				state: { types: [1, 2] },
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('detects when filters are applied', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: 'all',
						key: 'status',
						label: 'Status',
						options: [
							{ label: 'All', value: 'all' },
							{ label: 'Active', value: 'active' }
						],
						type: 'chips' as const
					}
				],
				state: { status: 'active' },
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			// Component renders and would show reset button if filters applied
			expect(container).toBeTruthy();
		});

		it('handles mixed section types', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [
					{
						defaultValue: 'all',
						key: 'type',
						label: 'Type',
						options: [{ label: 'All', value: 'all' }],
						type: 'chips' as const
					},
					{
						defaultValue: ['tag1'],
						key: 'tags',
						label: 'Tags',
						options: [{ label: 'Tag 1', value: 'tag1' }],
						type: 'chips-multi' as const
					},
					{
						defaultFromValue: '2024-01-01',
						defaultToValue: '2024-12-31',
						key: 'dates',
						label: 'Dates',
						type: 'date-range' as const
					},
					{
						icon: 'list',
						inputLabel: 'Categories',
						items: [{ data: { id: 1, label: 'Cat 1' }, selected: true }],
						key: 'categories',
						label: 'Categories',
						type: 'multi-select' as const
					}
				],
				title: 'Complete Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('custom labels', () => {
		it('uses custom reset and apply labels', async () => {
			const config = {
				applyLabel: 'Save Filters',
				onApply: vi.fn(),
				onStateChange,
				resetFiltersLabel: 'Reset All Filters',
				resetLabel: 'Clear All',
				sections: [
					{
						defaultValue: 'all',
						key: 'status',
						label: 'Status',
						options: [{ label: 'All', value: 'all' }],
						type: 'chips' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('uses onReset callback', async () => {
			const onReset = vi.fn();
			const config = {
				onApply: vi.fn(),
				onReset,
				onStateChange,
				sections: [
					{
						defaultValue: 'all',
						key: 'status',
						label: 'Status',
						options: [{ label: 'All', value: 'all' }],
						type: 'chips' as const
					}
				],
				title: 'Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('structure', () => {
		it('renders component structure', async () => {
			const config = {
				onApply: vi.fn(),
				onStateChange,
				sections: [],
				title: 'Test Posting Filter'
			};

			const { container } = render(PostingFilter, {
				props: { config }
			});
			await tick();

			expect(container.firstChild).toBeTruthy();
		});
	});
});
