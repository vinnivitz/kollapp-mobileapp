import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

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

import PageNotFound from '$lib/components/shared/NotFound.svelte';

describe('widgets/PageNotFound', () => {
	it('PageNotFound renders content', () => {
		const { container } = render(PageNotFound);
		expect(container.firstChild).toBeTruthy();
	});

	it('renders bug icon', () => {
		const { container } = render(PageNotFound);
		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
	});

	it('renders card with title', () => {
		const { container } = render(PageNotFound);
		const card = container.querySelector('ion-card');
		expect(card).toBeTruthy();
	});

	it('renders back-to-home button', async () => {
		const { container } = render(PageNotFound);
		const button = container.querySelector('ion-button');
		expect(button).toBeTruthy();
		if (button) {
			await fireEvent.click(button);
			expect(goto).toHaveBeenCalled();
		}
	});
});
