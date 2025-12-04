import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import PageNotFound from '$lib/components/widgets/PageNotFound.svelte';

describe('widgets/PageNotFound', () => {
	it('PageNotFound shows icon and navigates on button click', async () => {
		const { container } = render(PageNotFound);
		expect(container.querySelector('ion-icon')).toBeTruthy();

		const button = container.querySelector('ion-button');
		expect(button).toBeTruthy();
		await fireEvent.click(button!);

		const { goto } = await import('$app/navigation');
		expect(goto).toHaveBeenCalled();
	});
});
