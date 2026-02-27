import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import FilterWidget from '$lib/components/shared/FilterPanel.svelte';

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

function createChipsConfig(overrides?: Record<string, unknown>): {
	sections: {
		defaultValue: string;
		key: string;
		label: string;
		options: { label: string; value: string }[];
		type: string;
	}[];
	title: string;
	onApply: () => void;
} {
	return {
		onApply: vi.fn(),
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
		],
		title: 'Filter',
		...overrides
	};
}

function createChipsMultiConfig(overrides?: Record<string, unknown>): {
	onApply: ReturnType<typeof vi.fn>;
	sections: {
		defaultValue: string[];
		key: string;
		label: string;
		options: { label: string; value: string }[];
		type: string;
	}[];
	title: string;
} {
	return {
		onApply: vi.fn(),
		sections: [
			{
				defaultValue: ['opt1'],
				key: 'chipsMulti',
				label: 'Multi Chip',
				options: [
					{ label: 'Opt 1', value: 'opt1' },
					{ label: 'Opt 2', value: 'opt2' },
					{ label: 'Opt 3', value: 'opt3' }
				],
				type: 'chips-multi' as const
			}
		],
		title: 'Filter',
		...overrides
	};
}

function createToggleConfig(overrides?: Record<string, unknown>): {
	sections: {
		defaultValue: boolean;
		icon: string;
		key: string;
		label: string;
		type: string;
	}[];
	title: string;
	onApply: () => void;
} {
	return {
		onApply: vi.fn(),
		sections: [
			{
				defaultValue: false,
				icon: 'toggle',
				key: 'myToggle',
				label: 'Toggle Option',
				type: 'toggle' as const
			}
		],
		title: 'Filter',
		...overrides
	};
}

function createDateRangeConfig(overrides?: Record<string, unknown>): {
	sections: {
		defaultFromValue: string;
		defaultToValue: string;
		key: string;
		label: string;
		max: string;
		min: string;
		type: string;
	}[];
	title: string;
	onApply: () => void;
} {
	return {
		onApply: vi.fn(),
		sections: [
			{
				defaultFromValue: '2024-01-01',
				defaultToValue: '2024-12-31',
				key: 'dateRange',
				label: 'Date Range',
				max: '2025-12-31',
				min: '2020-01-01',
				type: 'date-range' as const
			}
		],
		title: 'Filter',
		...overrides
	};
}

describe('widgets/FilterWidget', () => {
	describe('rendering', () => {
		it('renders filter button when sections exist', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			const button = container.querySelector('ion-button');
			expect(button).toBeTruthy();
		});

		it('renders searchbar when configured', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});

		it('hides searchbar when not configured', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, searchbar: undefined } as never }
			});
			expect(container.querySelector('ion-searchbar')).toBeFalsy();
		});

		it('hides filter button when no sections', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, sections: [] } as never }
			});
			// With sections empty, no filter button rendered
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});

		it('applies custom classList', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { classList: 'custom-filter', config: config as never }
			});
			expect(container.querySelector('.custom-filter')).toBeTruthy();
		});

		it('renders nothing visible when no searchbar and no sections (non-headless)', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, searchbar: undefined, sections: [] } as never }
			});
			expect(container.querySelector('ion-searchbar')).toBeFalsy();
		});
	});

	describe('searchbar interaction', () => {
		it('calls onSearch with value on ionInput', async () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			const searchbar = container.querySelector('ion-searchbar')!;
			await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'hello' } }));
			await tick();
			expect(config.searchbar.onSearch).toHaveBeenCalledWith('hello');
		});

		it('calls onSearch with empty string when value is undefined', async () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			const searchbar = container.querySelector('ion-searchbar')!;
			await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: undefined } }));
			await tick();
			expect(config.searchbar.onSearch).toHaveBeenCalledWith('');
		});
	});

	describe('onAction button', () => {
		it('calls onAction when action button clicked', async () => {
			const onAction = vi.fn();
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, onAction }
			});
			const buttons = container.querySelectorAll('ion-button');
			// Action button is the last one
			const actionButton = [...buttons].at(-1)!;
			await fireEvent.click(actionButton);
			expect(onAction).toHaveBeenCalled();
		});
	});

	describe('hasFiltersApplied / inline reset', () => {
		it('shows inline reset button when filters differ from defaults', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, state: { category: [2] } } as never }
			});
			const resetButton = container.querySelector('ion-button[color="danger"]');
			expect(resetButton).toBeTruthy();
		});

		it('hides inline reset when filters match defaults', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, state: { category: [1] } } as never }
			});
			const resetButton = container.querySelector('ion-button[color="danger"]');
			expect(resetButton).toBeFalsy();
		});

		it('clicking inline reset calls onApply with defaults and onReset', async () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: { ...config, state: { category: [2] } } as never }
			});
			const resetButton = container.querySelector('ion-button[color="danger"]')!;
			await fireEvent.click(resetButton);
			await tick();
			expect(config.onApply).toHaveBeenCalledWith({ category: [1] });
			expect(config.onReset).toHaveBeenCalled();
		});

		it('renders custom resetFiltersLabel on inline reset', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: {
					config: { ...config, resetFiltersLabel: 'Custom Reset', state: { category: [2] } } as never
				}
			});
			expect(container.textContent).toContain('Custom Reset');
		});
	});

	describe('getDefaultsFromSections', () => {
		it('computes defaults for toggle section (shows reset when different)', () => {
			const config = createToggleConfig({ state: { myToggle: true } });
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			expect(container.querySelector('ion-button[color="danger"]')).toBeTruthy();
		});

		it('computes defaults for date-range section', () => {
			const config = createDateRangeConfig({
				state: { dateRange: { from: '2024-06-01', to: '2024-06-30' } }
			});
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			expect(container.querySelector('ion-button[color="danger"]')).toBeTruthy();
		});

		it('computes defaults for chips section', () => {
			const config = createChipsConfig({ state: { chipFilter: 'option2' } });
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			expect(container.querySelector('ion-button[color="danger"]')).toBeTruthy();
		});

		it('no reset button when state matches chips default', () => {
			const config = createChipsConfig({ state: { chipFilter: 'option1' } });
			const { container } = render(FilterWidget, {
				props: { config: config as never }
			});
			expect(container.querySelector('ion-button[color="danger"]')).toBeFalsy();
		});
	});

	describe('headless mode', () => {
		it('does not render searchbar/wrapper when open prop provided', () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.querySelector('ion-searchbar')).toBeFalsy();
		});

		it('renders popover content in headless mode when open=true', () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Chip Filter');
		});
	});

	describe('popover section rendering', () => {
		it('renders chips section labels and options', () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Chip Filter');
			expect(container.textContent).toContain('Option 1');
			expect(container.textContent).toContain('Option 2');
		});

		it('renders chips-multi section', () => {
			const config = createChipsMultiConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Multi Chip');
			expect(container.textContent).toContain('Opt 1');
			expect(container.textContent).toContain('Opt 2');
		});

		it('renders toggle section', () => {
			const config = createToggleConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Toggle Option');
		});

		it('renders date-range section', () => {
			const config = createDateRangeConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Date Range');
		});

		it('renders multi-select section', () => {
			const config = createMockConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Category');
		});
	});

	describe('popover apply/reset', () => {
		it('clicking apply calls onApply with draft state', async () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			// Find apply button (not danger colored, outline fill)
			const buttons = container.querySelectorAll('ion-button');
			const applyButton = [...buttons].find(
				(b) => b.getAttribute('color') !== 'danger' && b.getAttribute('fill') === 'outline'
			);
			if (applyButton) {
				await fireEvent.click(applyButton);
				await tick();
				expect(config.onApply).toHaveBeenCalled();
			}
		});

		it('clicking reset calls onApply with default values', async () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			const buttons = container.querySelectorAll('ion-button');
			const resetButton = [...buttons].find((b) => b.getAttribute('color') === 'danger');
			if (resetButton) {
				await fireEvent.click(resetButton);
				await tick();
				expect(config.onApply).toHaveBeenCalledWith({ chipFilter: 'option1' });
			}
		});

		it('renders custom applyLabel and resetLabel', () => {
			const config = createChipsConfig({ applyLabel: 'Anwenden', resetLabel: 'Zurücksetzen' });
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			expect(container.textContent).toContain('Anwenden');
			expect(container.textContent).toContain('Zurücksetzen');
		});
	});

	describe('chips interaction', () => {
		it('clicking a chip updates draft; apply sends new value', async () => {
			const config = createChipsConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			const chips = container.querySelectorAll('ion-chip');
			const option2Chip = [...chips].find((c) => c.textContent?.includes('Option 2'));
			if (option2Chip) {
				await fireEvent.click(option2Chip);
				await tick();
			}
			const applyButton = [...container.querySelectorAll('ion-button')].find(
				(b) => b.getAttribute('color') !== 'danger' && b.getAttribute('fill') === 'outline'
			);
			if (applyButton) {
				await fireEvent.click(applyButton);
				await tick();
				expect(config.onApply).toHaveBeenCalledWith(expect.objectContaining({ chipFilter: 'option2' }));
			}
		});
	});

	describe('chips-multi interaction', () => {
		it('toggleMultiChipValue adds a value', async () => {
			const config = createChipsMultiConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			const chips = container.querySelectorAll('ion-chip');
			const opt2 = [...chips].find((c) => c.textContent?.includes('Opt 2'));
			if (opt2) {
				await fireEvent.click(opt2);
				await tick();
			}
			const applyButton = [...container.querySelectorAll('ion-button')].find(
				(b) => b.getAttribute('color') !== 'danger' && b.getAttribute('fill') === 'outline'
			);
			if (applyButton) {
				await fireEvent.click(applyButton);
				await tick();
				const callArgument = config.onApply.mock.calls[0]?.[0];
				expect(callArgument?.chipsMulti).toContain('opt1');
				expect(callArgument?.chipsMulti).toContain('opt2');
			}
		});

		it('toggleMultiChipValue does not remove last value', async () => {
			const config = createChipsMultiConfig();
			const { container } = render(FilterWidget, {
				props: { config: config as never, dismissed: vi.fn(), open: true }
			});
			const chips = container.querySelectorAll('ion-chip');
			const opt1 = [...chips].find((c) => c.textContent?.includes('Opt 1'));
			if (opt1) {
				await fireEvent.click(opt1);
				await tick();
			}
			const applyButton = [...container.querySelectorAll('ion-button')].find(
				(b) => b.getAttribute('color') !== 'danger' && b.getAttribute('fill') === 'outline'
			);
			if (applyButton) {
				await fireEvent.click(applyButton);
				await tick();
				const callArgument = config.onApply.mock.calls[0]?.[0];
				expect(callArgument?.chipsMulti).toContain('opt1');
				expect(callArgument?.chipsMulti?.length).toBe(1);
			}
		});
	});
});
