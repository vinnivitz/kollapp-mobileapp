import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Card from '$lib/components/core/display/Card.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child Content</div>` }));

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

describe('widgets/ionic/Card', () => {
	it('renders clickable card with header and children', async () => {
		const clicked = vi.fn();
		const { container } = render(Card, {
			props: {
				children,
				clicked,
				subtitle: 'Sub',
				title: 'Title',
				titleIconEnd: 'end',
				titleIconStart: 'start'
			}
		});
		const card = container.querySelector('ion-card')!;
		expect(container.querySelector('ion-card-header')).toBeTruthy();
		expect(container.querySelector('ion-card-content')).toBeTruthy();
		card.click();
		expect(clicked).toHaveBeenCalled();
	});

	it('renders non-clickable when no handler', () => {
		const { container } = render(Card, { props: { title: 'T' } });
		expect(container.querySelector('ion-card[button]')).toBeFalsy();
	});
	it('non-clickable with border and various header elements', () => {
		const { container } = render(Card, {
			props: {
				border: 'secondary',
				classList: 'x',
				subtitle: 'Sub',
				title: 'Title',
				titleIconEnd: 'end',
				titleIconStart: 'start'
			}
		});
		const card = container.querySelector('ion-card')!;
		expect(card.getAttribute('class') || '').toContain('x');
		expect(container.querySelector('ion-card-header')).toBeTruthy();
		expect(card.getAttribute('button')).toBeNull();
	});

	it('clickable without header elements', async () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { clicked } });
		const card = container.querySelector('ion-card')!;
		expect(card.hasAttribute('button')).toBe(true);
		card.click();
		expect(clicked).toHaveBeenCalled();
	});

	it('fires click on Enter keydown', async () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { clicked, title: 'Enter Card' } });
		const card = container.querySelector('ion-card')!;
		await fireEvent.keyDown(card, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
	});

	it('renders in readonly mode with no pointer events', () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { clicked, readonly: true, title: 'Readonly' } });
		const card = container.querySelector('ion-card');
		expect(card?.style.pointerEvents).toBe('none');
	});

	it('renders with only titleIconEnd', () => {
		const { container } = render(Card, { props: { titleIconEnd: 'arrow-forward' } });
		const icons = container.querySelectorAll('ion-card-title ion-icon');
		expect(icons.length).toBe(1);
	});

	it('renders with only titleIconStart', () => {
		const { container } = render(Card, { props: { titleIconStart: 'arrow-back' } });
		const icons = container.querySelectorAll('ion-card-title ion-icon');
		expect(icons.length).toBe(1);
	});

	it('renders with lazy prop', () => {
		const { container } = render(Card, { props: { lazy: true, title: 'Lazy Card' } });
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with contentClass prop', () => {
		const { container } = render(Card, { props: { children, contentClass: 'custom-content', title: 'Content' } });
		const content = container.querySelector('ion-card-content');
		expect(content?.className).toContain('custom-content');
	});

	it('renders with iconColor prop', () => {
		const { container } = render(Card, { props: { iconColor: 'primary', titleIconStart: 'home' } });
		const icon = container.querySelector('ion-icon');
		expect(icon?.getAttribute('color')).toBe('primary');
	});

	it('renders with tourId data attribute', () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { clicked, title: 'Tour', tourId: 'tour-step-1' } });
		const card = container.querySelector('ion-card');
		expect(card?.dataset.tour).toBe('tour-step-1');
	});

	it('renders with indexLabel id', () => {
		const { container } = render(Card, { props: { indexLabel: 'my-card-id', title: 'ID Card' } });
		const card = container.querySelector('ion-card#my-card-id');
		expect(card).toBeTruthy();
	});

	it('renders subtitle', () => {
		const { container } = render(Card, { props: { subtitle: 'Subtitle Text', title: 'Title' } });
		const subtitle = container.querySelector('ion-card-subtitle');
		expect(subtitle?.textContent).toBe('Subtitle Text');
	});

	it('uses title as ariaLabel when ariaLabel not provided', () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { clicked, title: 'Accessible Card' } });
		const card = container.querySelector('ion-card');
		expect(card?.getAttribute('aria-label')).toBe('Accessible Card');
	});

	it('uses custom ariaLabel when provided', () => {
		const clicked = vi.fn();
		const { container } = render(Card, { props: { ariaLabel: 'Custom Label', clicked, title: 'Card' } });
		const card = container.querySelector('ion-card');
		expect(card?.getAttribute('aria-label')).toBe('Custom Label');
	});

	it('fires titleIconEndClicked handler when title icon button is clicked', async () => {
		const titleIconEndClicked = vi.fn();
		const { container } = render(Card, {
			props: {
				title: 'Clickable Icon',
				titleIconEnd: 'settings',
				titleIconEndClicked
			}
		});
		const button = container.querySelector('ion-card-title ion-button');
		expect(button).toBeTruthy();
		await fireEvent.click(button!);
		expect(titleIconEndClicked).toHaveBeenCalled();
	});

	it('renders card with border prop (color is transparent)', () => {
		const { container } = render(Card, { props: { border: 'primary', title: 'Bordered' } });
		const card = container.querySelector('ion-card');
		// When border is set, color defaults to 'transparent'
		expect(card?.getAttribute('color')).toBe('transparent');
	});
});
