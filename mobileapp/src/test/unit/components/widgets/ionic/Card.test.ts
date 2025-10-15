import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Card from '$lib/components/widgets/ionic/Card.svelte';

const childContent = 'Child content';
const children = createRawSnippet(() => ({
	render: () => `<p>${childContent}</p>`
}));

describe('CardComponent', () => {
	it('renders title, subtitle, and children correctly', () => {
		const properties = {
			children,
			subtitle: 'Test Subtitle',
			title: 'Test Title'
		};

		const { container } = render(Card, { props: properties });
		const ionCardTitle = container.querySelector('ion-card-title');
		const ionCardSubtitle = container.querySelector('ion-card-subtitle');
		const ionCardContent = container.querySelector('ion-card-content');

		expect(ionCardTitle?.textContent).toBe(properties.title);
		expect(ionCardSubtitle?.textContent).toBe(properties.subtitle);
		expect(ionCardContent?.textContent).toContain(childContent);
	});

	it('calls the clicked callback when the card is clicked', async () => {
		const clicked = vi.fn();
		const properties = {
			children,
			clicked
		};

		const { container } = render(Card, { props: properties });
		const ionCard = container.querySelector('ion-card');

		expect(ionCard).toBeTruthy();

		await fireEvent.click(ionCard as HTMLElement);
		expect(clicked).toHaveBeenCalledTimes(1);
	});

	it('exposes button semantics (role + tabindex) when clickable', async () => {
		const clicked = vi.fn();
		const { container } = render(Card, {
			props: { children, clicked }
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard?.getAttribute('role')).toBe('button');
		expect(ionCard?.getAttribute('tabindex')).toBe('0');

		await fireEvent.keyDown(ionCard, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
	});

	it('does not expose button semantics when not clickable', () => {
		const { container } = render(Card, {
			props: { children }
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard?.getAttribute('role')).toBeNull();
		expect(ionCard?.getAttribute('tabindex')).toBeNull();
	});

	it('defaults color to transparent when border is provided and applies border class', () => {
		const { container } = render(Card, {
			props: {
				border: 'primary',
				children
			}
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard.getAttribute('color')).toBe('transparent');

		const cls = ionCard.getAttribute('class') ?? '';
		expect(cls).toContain('border');
		expect(cls).toContain('border-[var(--ion-color-primary)]');
	});

	it('defaults color to light and has no border class when border is omitted', () => {
		const { container } = render(Card, {
			props: { children }
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard.getAttribute('color')).toBe('light');

		const cls = ionCard.getAttribute('class') ?? '';
		expect(cls).not.toContain('border border-');
	});

	it('sets pointer-events to none in style when readonly is true (clickable card)', () => {
		const clicked = vi.fn();
		const { container } = render(Card, {
			props: { children, clicked, readonly: true }
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard.getAttribute('style')).toContain('pointer-events: none');
	});

	it('sets pointer-events to auto in style when readonly is false/undefined (clickable card)', () => {
		const clicked = vi.fn();
		const { container } = render(Card, {
			props: { children, clicked }
		});

		const ionCard = container.querySelector('ion-card') as HTMLElement;
		expect(ionCard.getAttribute('style')).toContain('pointer-events: auto');
	});
});
