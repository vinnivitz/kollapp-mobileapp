import { fireEvent, render } from '@testing-library/svelte';
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

import PageNotFound from '$lib/components/widgets/PageNotFound.svelte';

describe('widgets/PageNotFound', () => {
	it('PageNotFound shows icon and navigates on button click', async () => {
		const { container } = render(PageNotFound);
		expect(container.querySelector('ion-icon')).toBeTruthy();

		const button = container.querySelector('ion-button');
		expect(button).toBeTruthy();
		await fireEvent.click(button!);

		const { goto } = await import('$app/navigation');
		expect(goto).toHaveBeenCalled();
	});
});
