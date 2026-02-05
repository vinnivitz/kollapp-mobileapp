import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Chip from '$lib/components/widgets/ionic/Chip.svelte';

describe('widgets/ionic/Chip', () => {
	it('clicks and Enter key triggers handler', async () => {
		const clicked = vi.fn();
		const { container } = render(Chip, { props: { clicked, label: 'Chip' } });
		const chip = container.querySelector('ion-chip')!;
		await fireEvent.click(chip);
		await fireEvent.keyDown(chip, { key: 'Enter' });
		expect(clicked).toHaveBeenCalledTimes(2);
	});

	it('outline attribute toggles with selected', () => {
		const { container } = render(Chip, { props: { label: 'A', selected: false } });
		const chip = container.querySelector('ion-chip')!;
		expect(chip.getAttribute('outline')).toBe('true');
	});

	it('renders with selected state', () => {
		const { container } = render(Chip, { props: { label: 'Selected', selected: true } });
		const chip = container.querySelector('ion-chip')!;
		expect(chip.getAttribute('outline')).toBe('false');
		expect(chip.getAttribute('aria-pressed')).toBe('true');
	});

	it('renders with start icon', () => {
		const { container } = render(Chip, { props: { icon: 'home', label: 'Home' } });
		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
		expect(icon?.getAttribute('icon')).toBe('home');
	});

	it('renders with end icon', () => {
		const { container } = render(Chip, { props: { iconEnd: 'arrow-forward', label: 'Next' } });
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBe(1);
		expect(icons[0]?.getAttribute('icon')).toBe('arrow-forward');
	});

	it('renders with both icons', () => {
		const { container } = render(Chip, { props: { icon: 'home', iconEnd: 'arrow', label: 'Both' } });
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBe(2);
	});

	it('applies iconColor to icons', () => {
		const { container } = render(Chip, { props: { icon: 'home', iconColor: 'danger', label: 'Colored' } });
		const icon = container.querySelector('ion-icon');
		expect(icon?.getAttribute('color')).toBe('danger');
	});

	it('renders with tourId data attribute', () => {
		const { container } = render(Chip, { props: { label: 'Tour', tourId: 'chip-tour' } });
		const chip = container.querySelector('ion-chip');
		expect(chip?.dataset.tour).toBe('chip-tour');
	});

	it('uses label as ariaLabel when ariaLabel not provided', () => {
		const { container } = render(Chip, { props: { label: 'Accessible Chip' } });
		const chip = container.querySelector('ion-chip');
		expect(chip?.getAttribute('aria-label')).toBe('Accessible Chip');
	});

	it('uses custom ariaLabel when provided', () => {
		const { container } = render(Chip, { props: { ariaLabel: 'Custom Aria', label: 'Chip' } });
		const chip = container.querySelector('ion-chip');
		expect(chip?.getAttribute('aria-label')).toBe('Custom Aria');
	});

	it('applies custom classList', () => {
		const { container } = render(Chip, { props: { classList: 'my-chip', label: 'Styled' } });
		const chip = container.querySelector('ion-chip.my-chip');
		expect(chip).toBeTruthy();
	});

	it('does not trigger click on non-Enter key', async () => {
		const clicked = vi.fn();
		const { container } = render(Chip, { props: { clicked, label: 'Chip' } });
		const chip = container.querySelector('ion-chip')!;
		await fireEvent.keyDown(chip, { key: 'Space' });
		expect(clicked).not.toHaveBeenCalled();
	});
});
