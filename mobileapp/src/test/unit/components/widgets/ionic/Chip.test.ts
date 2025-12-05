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
		render(Chip, { props: { label: 'B', selected: true } });
	});
});
