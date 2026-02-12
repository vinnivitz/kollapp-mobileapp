import { render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LazyRender from '$lib/components/core/animation/LazyRender.svelte';

const childHtml = 'Lazy Content';
const children = createRawSnippet(() => ({ render: () => `<div>${childHtml}</div>` }));

describe('utility/LazyRender', () => {
	let mockObserverInstance: {
		disconnect: ReturnType<typeof vi.fn>;
		observe: ReturnType<typeof vi.fn>;
	};
	let observerCallback: (entries: IntersectionObserverEntry[]) => void;
	let observerOptions: IntersectionObserverInit;

	beforeEach(() => {
		mockObserverInstance = {
			disconnect: vi.fn(),
			observe: vi.fn()
		};

		// Create a proper constructor function
		const MockIntersectionObserver = function (
			this: typeof mockObserverInstance,
			callback: (entries: IntersectionObserverEntry[]) => void,
			options: IntersectionObserverInit
		) {
			observerCallback = callback;
			observerOptions = options;
			return mockObserverInstance;
		} as unknown as typeof IntersectionObserver;

		vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('renders placeholder container on mount', () => {
		const { container } = render(LazyRender, { props: { children } });
		const wrapper = container.querySelector('div');
		expect(wrapper).toBeTruthy();
	});

	it('does not render children when not visible', () => {
		const { container } = render(LazyRender, { props: { children } });
		expect(container.textContent).not.toContain(childHtml);
	});

	it('renders children when intersection observer reports visibility', async () => {
		const { container } = render(LazyRender, { props: { children } });

		// Simulate becoming visible
		observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);

		await waitFor(() => {
			expect(container.textContent).toContain(childHtml);
		});
	});

	it('keeps children rendered after becoming hidden when keepRendered is true (default)', async () => {
		const { container } = render(LazyRender, { props: { children, keepRendered: true } });

		// Become visible
		observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
		await waitFor(() => {
			expect(container.textContent).toContain(childHtml);
		});

		// Become hidden
		observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);

		// Should still be rendered due to keepRendered
		await waitFor(() => {
			expect(container.textContent).toContain(childHtml);
		});
	});

	it('removes children when hidden and keepRendered is false', async () => {
		const { container } = render(LazyRender, { props: { children, keepRendered: false } });

		// Become visible
		observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
		await waitFor(() => {
			expect(container.textContent).toContain(childHtml);
		});

		// Become hidden
		observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);

		await waitFor(() => {
			expect(container.textContent).not.toContain(childHtml);
		});
	});

	it('applies minHeight to placeholder when not rendered', () => {
		const { container } = render(LazyRender, { props: { children, minHeight: '200px' } });
		const wrapper = container.querySelector('div') as HTMLElement;
		expect(wrapper.style.minHeight).toBe('200px');
	});

	it('sets minHeight to auto when content is rendered', async () => {
		const { container } = render(LazyRender, { props: { children, minHeight: '200px' } });

		// Become visible
		observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);

		await waitFor(() => {
			const wrapper = container.querySelector('div') as HTMLElement;
			expect(wrapper.style.minHeight).toBe('auto');
		});
	});

	it('creates IntersectionObserver with correct options', () => {
		render(LazyRender, { props: { children, rootMargin: '100px', threshold: 0.5 } });

		expect(observerOptions.rootMargin).toBe('100px');
		expect(observerOptions.threshold).toBe(0.5);
	});

	it('observes the container element', () => {
		const { container } = render(LazyRender, { props: { children } });
		const wrapper = container.querySelector('div');
		expect(mockObserverInstance.observe).toHaveBeenCalledWith(wrapper);
	});

	it('disconnects observer on unmount', () => {
		const { unmount } = render(LazyRender, { props: { children } });
		unmount();
		expect(mockObserverInstance.disconnect).toHaveBeenCalled();
	});

	it('uses default prop values correctly', () => {
		const { container } = render(LazyRender, { props: { children } });
		const wrapper = container.querySelector('div') as HTMLElement;

		expect(wrapper.style.minHeight).toBe('100px');
		expect(observerOptions.rootMargin).toBe('50px');
		expect(observerOptions.threshold).toBe(0);
	});

	it('shows spinner after timeout when not yet visible', async () => {
		vi.useFakeTimers();
		const { container } = render(LazyRender, { props: { children } });

		// Before timeout, no spinner
		expect(container.querySelector('ion-spinner')).toBeFalsy();

		// Advance past the 100ms spinner timeout
		await vi.advanceTimersByTimeAsync(150);

		// Spinner should now be visible since content has not loaded
		expect(container.querySelector('ion-spinner')).toBeTruthy();
		vi.useRealTimers();
	});
});
