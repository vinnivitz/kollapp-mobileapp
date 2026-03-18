import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import SectionDivider from '$lib/components/internal/budget/statistics/SectionDivider.svelte';

describe('widgets/budget/statistics/SectionDivider', () => {
	it('renders title text', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Overview' }
		});
		expect(container.textContent).toContain('Overview');
	});

	it('renders subtitle when provided', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', subtitle: 'Balance at a glance', title: 'Overview' }
		});
		const note = container.querySelector('ion-note');
		expect(note).toBeTruthy();
		expect(note!.textContent).toContain('Balance at a glance');
	});

	it('does not render subtitle when not provided', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Overview' }
		});
		const note = container.querySelector('ion-note');
		expect(note).toBeFalsy();
	});

	it('renders icon element', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Overview' }
		});
		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
	});

	it('applies color to icon and title', () => {
		const { container } = render(SectionDivider, {
			props: { color: 'secondary', icon: 'trending-up-outline', title: 'Trends' }
		});
		const ionText = container.querySelector('ion-text');
		expect(ionText?.getAttribute('color')).toBe('secondary');
		const ionIcon = container.querySelector('ion-icon');
		expect(ionIcon?.getAttribute('color')).toBe('secondary');
	});

	it('defaults to primary color', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Overview' }
		});
		const ionText = container.querySelector('ion-text');
		expect(ionText?.getAttribute('color')).toBe('primary');
	});

	it('renders uppercase title text', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Details' }
		});
		const ionText = container.querySelector('ion-text');
		expect(ionText?.classList.contains('uppercase')).toBe(true);
	});

	it('renders icon circle with background', () => {
		const { container } = render(SectionDivider, {
			props: { color: 'tertiary', icon: 'people-outline', title: 'Breakdown' }
		});
		const circle = container.querySelector('.rounded-full');
		expect(circle).toBeTruthy();
		expect(circle?.getAttribute('style')).toContain('color-mix');
	});

	it('renders divider line', () => {
		const { container } = render(SectionDivider, {
			props: { icon: 'flash-outline', title: 'Overview' }
		});
		const line = container.querySelector('.h-px');
		expect(line).toBeTruthy();
	});
});
