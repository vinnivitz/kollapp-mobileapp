import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import ModalComponent from '$lib/components/widgets/ionic/Modal.svelte';

function registerMocks(): void {
	vi.mock('$lib/stores', () => ({
		modalStore: {
			add: vi.fn(),
			remove: vi.fn(),
			subscribe: vi.fn()
		}
	}));
}

describe('ModalComponent', () => {
	beforeAll(() => registerMocks());

	it('renders children content when open', () => {
		const childContent = 'This is modal content';
		const { container } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>${childContent}</p>` })),
				open: true
			}
		});
		const ionContent = container.querySelector('ion-content');
		expect(ionContent?.textContent).toContain(childContent);
	});

	it('calls dismissed callback and closes modal on cancel button click', async () => {
		const dismissed = vi.fn();
		const cancelLabel = 'Cancel Modal';
		const { getByText } = render(ModalComponent, {
			props: {
				cancelLabel,
				children: createRawSnippet(() => ({ render: () => `<p>Modal Content</p>` })),
				dismissed,
				open: true
			}
		});

		const cancelButton = getByText(cancelLabel);
		expect(cancelButton).toBeTruthy();

		await fireEvent.click(cancelButton);
		expect(dismissed).toHaveBeenCalled();
	});

	it('calls confirmed callback on confirm button click', async () => {
		const confirmed = vi.fn();
		const confirmLabel = 'Confirm Modal';

		const { getByText } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Modal Content</p>` })),
				confirmed,
				confirmLabel,
				open: true
			}
		});

		const confirmButton = getByText(confirmLabel);
		expect(confirmButton).toBeTruthy();

		await fireEvent.click(confirmButton);
		expect(confirmed).toHaveBeenCalled();
	});
});
