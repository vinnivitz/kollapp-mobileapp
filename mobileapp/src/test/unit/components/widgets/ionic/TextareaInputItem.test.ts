import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';

describe('widgets/ionic/TextareaInputItem', () => {
	it('calls change on ionInput', async () => {
		const change = vi.fn();
		const { container } = render(TextareaInputItem, { props: { changed: change, label: 'Tx', value: 'a' } });
		const ta = container.querySelector('ion-textarea') as HTMLIonTextareaElement;
		await fireEvent(ta, new CustomEvent('ionInput', { detail: { value: 'hello' } }));
		expect(change).toHaveBeenCalledWith('hello');
	});
});
