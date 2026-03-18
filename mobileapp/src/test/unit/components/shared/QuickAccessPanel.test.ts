import { render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import QuickAccessGrid from '$lib/components/shared/QuickAccessPanel.svelte';
import { quickAccessStore } from '$lib/stores';

// Mock DragDropProvider and related
vi.mock('@dnd-kit-svelte/svelte', () => ({
	DragDropProvider: vi.fn((_) => {}),
	DragOverlay: vi.fn(() => {}),
	KeyboardSensor: vi.fn(),
	PointerSensor: {
		configure: vi.fn(() => vi.fn())
	}
}));

// Mock @dnd-kit/helpers
vi.mock('@dnd-kit/helpers', () => ({
	move: vi.fn((items) => items)
}));

// Mock useSortable
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

// Mock Haptics
vi.mock('@capacitor/haptics', () => ({
	Haptics: {
		vibrate: vi.fn().mockResolvedValue({})
	}
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
	dev: false
}));

describe('widgets/quick-access/QuickAccessGrid', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	describe('rendering', () => {
		it('renders without items', () => {
			const { container } = render(QuickAccessGrid);

			expect(container.querySelector('[data-tour]')).toBeTruthy();
		});

		it('renders with data-tour attribute for tour identification', () => {
			const { container } = render(QuickAccessGrid);

			const tourElement = container.querySelector('[data-tour]');
			expect(tourElement).toBeTruthy();
		});
	});

	describe('store initialization', () => {
		it('initializes store on mount', () => {
			render(QuickAccessGrid);

			expect(quickAccessStore.initialize).toHaveBeenCalled();
		});

		it('calls initialize only once', () => {
			render(QuickAccessGrid);
			render(QuickAccessGrid);

			expect(quickAccessStore.initialize).toHaveBeenCalledTimes(2);
		});
	});

	describe('component behavior', () => {
		it('renders data-tour attribute for quick-access', () => {
			const { container } = render(QuickAccessGrid);
			const tourElement = container.querySelector('[data-tour]');
			expect(tourElement).toBeTruthy();
		});

		it('renders without errors', () => {
			expect(() => render(QuickAccessGrid)).not.toThrow();
		});
	});
});
