import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet, tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import ModalComponent from '$lib/components/widgets/ionic/Modal.svelte';

// Hoisted mocks for dependencies
const addMock = vi.hoisted(() => vi.fn());
const removeMock = vi.hoisted(() => vi.fn());
const subscribeMock = vi.hoisted(() =>
	vi.fn((run: (v: unknown[]) => void) => {
		run([]);
		return () => {};
	})
);
const getPlatformsMock = vi.hoisted(() => vi.fn(() => ['desktop']));
const getTopMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));

function registerMocks(): void {
	vi.mock('$lib/stores', () => ({
		modalStore: {
			add: addMock,
			remove: removeMock,
			subscribe: subscribeMock
		}
	}));
	vi.mock('@ionic/core', () => ({
		getPlatforms: getPlatformsMock,
		modalController: {
			getTop: getTopMock
		}
	}));
}

describe('ModalComponent', () => {
	beforeAll(() => registerMocks());
	beforeEach(() => {
		addMock.mockClear();
		removeMock.mockClear();
		subscribeMock.mockClear().mockImplementation((run: (v: unknown[]) => void) => {
			run([]);
			return () => {};
		});
		getPlatformsMock.mockClear().mockReturnValue(['desktop']);
		getTopMock.mockClear().mockResolvedValue({});
	});

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

	it('does not add/remove modal to store when controller is falsy (lazy open=false)', () => {
		render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				lazy: true,
				open: false
			}
		});
		expect(addMock).not.toHaveBeenCalled();
		expect(removeMock).not.toHaveBeenCalled();
	});

	it('calls requestSubmit on inner form when confirming', async () => {
		const confirmed = vi.fn();
		const { container } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<form id="f"><input name="x"/></form>` })),
				confirmed,
				open: true
			}
		});
		const form = container.querySelector('form') as HTMLFormElement;
		expect(form).toBeTruthy();
		const submitSpy = vi.fn();
		form.requestSubmit = submitSpy;
		const button = container.querySelector('ion-buttons[slot="end"] ion-button') as HTMLElement;
		expect(button).toBeTruthy();
		await fireEvent.click(button);
		expect(submitSpy).toHaveBeenCalled();
		expect(confirmed).toHaveBeenCalled();
	});

	it('onPresent sets other modals current breakpoint to 1', async () => {
		const other1 = { setCurrentBreakpoint: vi.fn() };
		const other2 = { setCurrentBreakpoint: vi.fn() };
		// Provide two other modals via store value
		subscribeMock.mockImplementation((run: (v: unknown[]) => void) => {
			run([other1, other2]);
			return () => {};
		});
		const { container } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		const modal = container.querySelector('ion-modal') as HTMLElement;
		expect(modal).toBeTruthy();
		await fireEvent(modal, new CustomEvent('willPresent'));
		expect(other1.setCurrentBreakpoint).toHaveBeenCalledWith(1);
		expect(other2.setCurrentBreakpoint).toHaveBeenCalledWith(1);
	});

	it('onDestroy returns early on non-web platforms (no getTop call)', async () => {
		getPlatformsMock.mockReturnValue(['ios']);
		const { unmount } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		unmount();
		await tick();
		expect(getTopMock).not.toHaveBeenCalled();
	});

	it('onDestroy dismisses top controller when it matches current modal', async () => {
		const { container, unmount } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		await tick();
		const modalElement = container.querySelector('ion-modal') as HTMLIonModalElement & {
			dismiss?: () => Promise<void>;
		};
		modalElement.dismiss = vi.fn().mockResolvedValue({});
		getPlatformsMock.mockReturnValue(['desktop']);
		getTopMock.mockResolvedValue(modalElement);
		unmount();
		await waitFor(() => expect(getTopMock).toHaveBeenCalled());
		await waitFor(() => expect(modalElement.dismiss).toHaveBeenCalled());
	});

	it('onDestroy ignores errors when dismiss rejects (catch path)', async () => {
		const { container, unmount } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		await tick();
		const modalElement = container.querySelector('ion-modal') as HTMLIonModalElement & {
			dismiss?: () => Promise<void>;
		};
		const rejectSpy = vi.fn().mockRejectedValue(new Error('dismiss failed'));
		modalElement.dismiss = rejectSpy;
		getPlatformsMock.mockReturnValue(['desktop']);
		getTopMock.mockResolvedValue(modalElement);
		unmount();
		await waitFor(() => expect(getTopMock).toHaveBeenCalled());
		await waitFor(() => expect(rejectSpy).toHaveBeenCalled());
	});

	it('does not set breakpoints attribute when breakpoints is falsy', () => {
		const { container } = render(ModalComponent, {
			props: {
				breakpoints: false,
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		const modal = container.querySelector('ion-modal') as HTMLElement;
		// Attribute should be absent when falsy
		expect(modal.getAttribute('breakpoints')).toBeNull();
	});

	it('onDestroy does not dismiss when top controller is different element', async () => {
		const { container, unmount } = render(ModalComponent, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>Content</p>` })),
				open: true
			}
		});
		const modalElement = container.querySelector('ion-modal') as HTMLIonModalElement;
		modalElement.dismiss = vi.fn();
		const otherElement = document.createElement('ion-modal') as unknown as HTMLIonModalElement;
		getPlatformsMock.mockReturnValue(['desktop']);
		getTopMock.mockResolvedValue(otherElement);
		unmount();
		await tick();
		expect(getTopMock).toHaveBeenCalled();
		expect(modalElement.dismiss).not.toHaveBeenCalled();
	});
});
