import type { Colors } from '$lib/models/ui';

import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child Content</div>` }));

describe('widgets/ionic/SegmentItem', () => {
	it('renders chips and children', async () => {
		const clicked = vi.fn();
		const config = [
			{ class: 'a', clicked, color: 'primary' as Colors, icon: 'a', label: 'A', selected: true },
			{ class: 'b', clicked: vi.fn(), color: 'secondary' as Colors, icon: 'b', label: 'B', selected: false }
		];
		const { container } = render(SegmentItem, { props: { children, classList: 'x', config } });
		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);
	});
});
