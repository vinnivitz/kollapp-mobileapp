import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import FabButton from '$lib/components/widgets/FabButton.svelte';

describe('FabButton', () => {
	it('renders ion-fab with default vertical and horizontal alignment', () => {
		const clickMock = vi.fn();
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				icon: 'add'
			}
		});

		const fab = container.querySelector('ion-fab');
		expect(fab).toBeTruthy();
		expect(fab?.getAttribute('vertical')).toBe('bottom');
		expect(fab?.getAttribute('horizontal')).toBe('end');
	});

	it('applies custom vertical and horizontal alignment', () => {
		const clickMock = vi.fn();
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				horizontal: 'center',
				icon: 'add',
				vertical: 'top'
			}
		});

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('vertical')).toBe('top');
		expect(fab?.getAttribute('horizontal')).toBe('center');
	});

	it('renders ion-fab-button with provided icon and default color', () => {
		const clickMock = vi.fn();
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				icon: 'add'
			}
		});

		const fabButton = container.querySelector('ion-fab-button');
		const icon = fabButton?.querySelector('ion-icon');

		expect(fabButton).toBeTruthy();
		expect(fabButton?.getAttribute('color')).toBe('secondary');
		expect(icon?.getAttribute('icon')).toBe('add');
	});

	it('applies custom color to ion-fab-button', () => {
		const clickMock = vi.fn();
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				color: 'danger',
				icon: 'add'
			}
		});

		const fabButton = container.querySelector('ion-fab-button');
		expect(fabButton?.getAttribute('color')).toBe('danger');
	});

	it('passes id to ion-fab', () => {
		const clickMock = vi.fn();
		const testId = 'my-fab';
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				icon: 'add',
				id: testId
			}
		});

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('id')).toBe(testId);
	});

	it('calls the click callback when the fab button is clicked', async () => {
		const clickMock = vi.fn();
		const { container } = render(FabButton, {
			props: {
				click: clickMock,
				icon: 'add'
			}
		});

		const fabButton = container.querySelector('ion-fab-button') as HTMLIonFabButtonElement;

		expect(fabButton).toBeTruthy();

		await fireEvent.click(fabButton);
		expect(clickMock).toHaveBeenCalled();
	});
});
