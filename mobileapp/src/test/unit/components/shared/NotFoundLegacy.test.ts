import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import PageNotFoundWidget from '$lib/components/shared/NotFound.svelte';

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

describe('widgets/PageNotFoundWidget', () => {
	it('renders bug icon', () => {
		const { container } = render(PageNotFoundWidget);
		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
	});

	it('renders title card', () => {
		const { container } = render(PageNotFoundWidget);
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders back to home button', () => {
		const { container } = render(PageNotFoundWidget);
		const button = container.querySelector('ion-button');
		expect(button).toBeTruthy();
	});

	it('navigates to home when button is clicked', async () => {
		const { container } = render(PageNotFoundWidget);
		const button = container.querySelector('ion-button')!;
		await fireEvent.click(button);
		expect(goto).toHaveBeenCalled();
	});
});
