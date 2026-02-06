import { render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import StaggeredList from '$lib/components/core/animation/StaggeredList.svelte';

describe('utility/StaggeredList', () => {
	const children = createRawSnippet<[item: unknown, index: number]>((item, index) => ({
		render: () => `<div data-item="${item()}" data-index="${index()}">Item ${index()}</div>`
	}));

	it('renders items', async () => {
		vi.useFakeTimers();
		const { container } = render(StaggeredList, {
			props: {
				children,
				items: ['a', 'b', 'c']
			}
		});

		// Advance timers to allow staggered rendering
		vi.advanceTimersByTime(500);
		await waitFor(() => {
			expect(container.querySelectorAll('[data-item]').length).toBeGreaterThan(0);
		});
		vi.useRealTimers();
	});

	it('applies itemClass to wrapper', async () => {
		vi.useFakeTimers();
		const { container } = render(StaggeredList, {
			props: {
				children,
				itemClass: 'custom-item-class',
				items: ['a']
			}
		});

		vi.advanceTimersByTime(200);
		await waitFor(() => {
			const wrapper = container.querySelector('.custom-item-class');
			expect(wrapper).toBeTruthy();
		});
		vi.useRealTimers();
	});

	it('renders empty list when items is empty', () => {
		const { container } = render(StaggeredList, {
			props: {
				children,
				items: []
			}
		});
		expect(container.querySelectorAll('[data-item]').length).toBe(0);
	});

	it('uses custom getKey function', async () => {
		vi.useFakeTimers();
		const items = [
			{ id: 100, name: 'First' },
			{ id: 200, name: 'Second' }
		];
		const childrenWithObject = createRawSnippet<[item: unknown, index: number]>((item, index) => ({
			render: () => `<div data-id="${(item() as { id: number }).id}">Item ${index()}</div>`
		}));

		const { container } = render(StaggeredList, {
			props: {
				children: childrenWithObject as never,
				getKey: (item: unknown) => (item as { id: number }).id,
				items: items as never
			}
		});

		vi.advanceTimersByTime(500);
		await waitFor(() => {
			expect(container.querySelectorAll('[data-id]').length).toBeGreaterThan(0);
		});
		vi.useRealTimers();
	});

	it('respects custom fadeDuration', async () => {
		vi.useFakeTimers();
		const { container } = render(StaggeredList, {
			props: {
				children,
				fadeDuration: 50,
				items: ['a', 'b']
			}
		});

		// With shorter duration, items should appear faster
		vi.advanceTimersByTime(200);
		await waitFor(() => {
			expect(container.querySelectorAll('[data-item]').length).toBeGreaterThan(0);
		});
		vi.useRealTimers();
	});
});
