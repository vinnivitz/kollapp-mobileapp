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
				children: createRawSnippet(() => ({
					render: () => `<p>${childContent}</p>`
				})),
				isOpen: true
			}
		});
		const ionContent = container.querySelector('ion-content');

		expect(ionContent?.textContent).toContain(childContent);
	});

	it('calls cancel callback and closes modal on cancel button click', async () => {
		const properties = {
			cancel: vi.fn(),
			cancelLabel: 'Cancel Modal',
			children: createRawSnippet(() => ({
				render: () => `<p>Modal Content</p>`
			})),
			open: true
		};
		const { getByText } = render(ModalComponent, { props: properties });
		const cancelButton = getByText(properties.cancelLabel);

		expect(cancelButton).toBeTruthy();

		await fireEvent.click(cancelButton);

		expect(properties.cancel).toHaveBeenCalled();
	});

	it('calls confirm callback on confirm button click', async () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Modal Content</p>`
			})),
			confirm: vi.fn(),
			confirmLabel: 'Confirm Modal',
			open: true
		};

		const { getByText } = render(ModalComponent, { props: properties });

		const confirmButton = getByText(properties.confirmLabel);
		expect(confirmButton).toBeTruthy();

		await fireEvent.click(confirmButton);

		expect(properties.confirm).toHaveBeenCalled();
	});

	it('does not render confirm button if confirm callback is not provided', () => {
		const properties = {
			children: createRawSnippet(() => ({
				render: () => `<p>Modal Content</p>`
			})),
			confirmLabel: 'Confirm Modal',
			open: true
		};

		const { queryByText } = render(ModalComponent, { props: properties });

		const confirmButton = queryByText(properties.confirmLabel);
		expect(confirmButton).toBeFalsy();
	});
});
