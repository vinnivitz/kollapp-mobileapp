import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Card from '$lib/components/widgets/ionic/Card.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child Content</div>` }));

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
});
