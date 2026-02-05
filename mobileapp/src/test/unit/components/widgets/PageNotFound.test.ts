import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

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

import PageNotFound from '$lib/components/widgets/PageNotFoundWidget.svelte';

describe('widgets/PageNotFound', () => {
	it('PageNotFound renders content', () => {
		const { container } = render(PageNotFound);
		expect(container.firstChild).toBeTruthy();
	});
});
