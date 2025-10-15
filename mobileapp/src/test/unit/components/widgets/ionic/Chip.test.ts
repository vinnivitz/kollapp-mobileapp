import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Chip from '$lib/components/widgets/ionic/Chip.svelte';

describe('Chip', () => {
	it('renders label, default color, outline when not selected, and classList', () => {
		const classList = 'my-chip extra';
		const { container } = render(Chip, {
			props: {
				classList,
				label: 'My Chip'
			}
		});

		const chip = container.querySelector('ion-chip') as HTMLElement;
		expect(chip).toBeTruthy();

		expect(chip.getAttribute('role')).toBe('button');
		expect(chip.getAttribute('tabindex')).toBe('0');

		expect(chip.getAttribute('color')).toBe('secondary');

		expect(chip.hasAttribute('outline')).toBe(true);

		const cls = chip.getAttribute('class') ?? '';
		expect(cls).toContain('my-chip');
		expect(cls).toContain('extra');

		expect(chip.textContent).toContain('My Chip');

		expect(container.querySelectorAll('ion-icon').length).toBe(0);
	});

	it('renders start and end icons when provided', () => {
		const { container } = render(Chip, {
			props: {
				icon: 'chevron-forward',
				iconEnd: 'close',
				label: 'Chip with icons'
			}
		});

		const startIcon = container.querySelector('ion-icon[class*="ps-0"]');
		const endIcon = container.querySelector('ion-icon[class*="p-0"]');

		expect(startIcon).toBeTruthy();
		expect(startIcon?.getAttribute('icon')).toBe('chevron-forward');

		expect(endIcon).toBeTruthy();
		expect(endIcon?.getAttribute('icon')).toBe('close');
	});

	it('uses explicit color and removes outline when selected=true', () => {
		const { container } = render(Chip, {
			props: {
				color: 'warning',
				label: 'Selected',
				selected: true
			}
		});

		const chip = container.querySelector('ion-chip') as HTMLElement;
		expect(chip.getAttribute('color')).toBe('warning');
		expect(chip.getAttribute('outline')).toBe('false');
	});

	it('handles click and Enter key when clicked is provided, ignores other keys', async () => {
		const clicked = vi.fn();
		const { container } = render(Chip, {
			props: {
				clicked,
				label: 'Clickable'
			}
		});

		const chip = container.querySelector('ion-chip') as HTMLElement;

		await fireEvent.click(chip);
		expect(clicked).toHaveBeenCalledTimes(1);

		await fireEvent.keyDown(chip, { key: ' ' }); // Space
		expect(clicked).toHaveBeenCalledTimes(1);

		await fireEvent.keyDown(chip, { key: 'Enter' });
		expect(clicked).toHaveBeenCalledTimes(2);
	});

	it('does not throw when clicked is omitted; Enter/click are no-ops', async () => {
		const { container } = render(Chip, {
			props: {
				label: 'Not clickable'
			}
		});

		const chip = container.querySelector('ion-chip') as HTMLElement;
		expect(chip).toBeTruthy();

		await fireEvent.click(chip);
		await fireEvent.keyDown(chip, { key: 'Enter' });

		expect(chip.getAttribute('role')).toBe('button');
		expect(chip.getAttribute('tabindex')).toBe('0');
	});
});
