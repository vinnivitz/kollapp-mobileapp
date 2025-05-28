import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { goto } from '$app/navigation';

import PageNotFound from '$lib/components/widgets/PageNotFound.svelte';
import { PageRoute } from '$lib/models/routing';

describe('PageNotFound Component', () => {
	it('calls goto with HOME route on button click', async () => {
		const { container } = render(PageNotFound);
		const ionButton = container.querySelector('ion-button') as HTMLIonButtonElement;

		expect(ionButton).toBeTruthy();

		await fireEvent.click(ionButton);

		await waitFor(() => {
			expect(goto).toHaveBeenCalledWith(PageRoute.HOME);
		});
	});
});
