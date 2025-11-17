import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';

describe('FabButton Component', () => {
	it('renders ion-fab with default vertical and horizontal alignment', () => {
		const properties = {
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fab = container.querySelector('ion-fab');
		expect(fab).toBeTruthy();
		expect(fab?.getAttribute('vertical')).toBe('bottom');
		expect(fab?.getAttribute('horizontal')).toBe('end');
	});

	it('applies custom vertical and horizontal alignment', () => {
		const properties = {
			clicked: vi.fn(),
			horizontal: 'center' as const,
			icon: 'add',
			label: 'Add Item',
			vertical: 'top' as const
		};
		const { container } = render(FabButton, { props: properties });

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('vertical')).toBe('top');
		expect(fab?.getAttribute('horizontal')).toBe('center');
	});

	it('renders ion-fab-button with provided icon and default color', () => {
		const properties = {
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-button');
		const icon = fabButton?.querySelector('ion-icon');

		expect(fabButton).toBeTruthy();
		expect(fabButton?.getAttribute('color')).toBe('secondary');
		expect(icon?.getAttribute('icon')).toBe('add');
	});

	it('applies custom color to ion-fab-button', () => {
		const properties = {
			clicked: vi.fn(),
			color: 'danger' as const,
			icon: 'trash',
			label: 'Delete Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-button');
		expect(fabButton?.getAttribute('color')).toBe('danger');
	});

	it('passes id to ion-fab', () => {
		const testId = 'my-fab';
		const properties = {
			clicked: vi.fn(),
			icon: 'add',
			id: testId,
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('id')).toBe(testId);
	});

	it('applies custom classList to ion-fab', () => {
		const properties = {
			classList: 'custom-class another-class',
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fab = container.querySelector('ion-fab');
		const classList = fab?.getAttribute('class') ?? '';
		expect(classList).toContain('custom-class');
		expect(classList).toContain('another-class');
		expect(classList).toContain('fixed');
	});

	it('sets aria-label on ion-fab for accessibility', () => {
		const properties = {
			icon: 'add',
			label: 'Add New Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('aria-label')).toBe('Add New Item');
	});

	it('calls the click callback when the fab button is clicked', async () => {
		const clickMock = vi.fn();
		const properties = {
			clicked: clickMock,
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-button') as HTMLIonFabButtonElement;

		expect(fabButton).toBeTruthy();

		await fireEvent.click(fabButton);
		expect(clickMock).toHaveBeenCalledTimes(1);
	});

	it('invokes clicked when pressing Enter (onkeydown handler)', async () => {
		const clickMock = vi.fn();
		const properties = {
			clicked: clickMock,
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-button') as HTMLIonFabButtonElement;

		await fireEvent.keyDown(fabButton, { key: 'Space' });
		expect(clickMock).not.toHaveBeenCalled();

		await fireEvent.keyDown(fabButton, { key: 'Enter' });
		expect(clickMock).toHaveBeenCalledTimes(1);
	});

	it('exposes button semantics (role and tabindex)', () => {
		const properties = {
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-button');
		expect(fabButton?.getAttribute('role')).toBe('button');
		expect(fabButton?.getAttribute('tabindex')).toBe('0');
	});

	it('renders without buttons by default (empty ion-fab-list)', () => {
		const properties = {
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabList = container.querySelector('ion-fab-list');
		expect(fabList).toBeNull();
	});

	it('renders ion-fab-list with buttons when buttons array is provided', () => {
		const button1Handler = vi.fn();
		const button2Handler = vi.fn();
		const properties = {
			buttons: [
				{
					color: 'primary' as const,
					handler: button1Handler,
					icon: 'share',
					label: 'Share'
				},
				{
					handler: button2Handler,
					icon: 'save',
					label: 'Save'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabList = container.querySelector('ion-fab-list');
		expect(fabList).toBeTruthy();
		expect(fabList?.getAttribute('side')).toBe('top');

		const fabButtons = container.querySelectorAll('ion-fab-list ion-fab-button');
		expect(fabButtons.length).toBe(2);
	});

	it('renders each button in ion-fab-list with correct properties', () => {
		const button1Handler = vi.fn();
		const button2Handler = vi.fn();
		const properties = {
			buttons: [
				{
					color: 'primary' as const,
					handler: button1Handler,
					icon: 'share',
					label: 'Share'
				},
				{
					handler: button2Handler,
					icon: 'save',
					label: 'Save'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButtons = container.querySelectorAll('ion-fab-list ion-fab-button');

		const firstButton = fabButtons[0]!;
		expect(firstButton.getAttribute('color')).toBe('primary');
		expect(firstButton.getAttribute('aria-label')).toBe('Share');
		expect(firstButton.querySelector('ion-icon')?.getAttribute('icon')).toBe('share');

		const secondButton = fabButtons[1]!;
		expect(secondButton.getAttribute('color')).toBe('secondary');
		expect(secondButton.getAttribute('aria-label')).toBe('Save');
		expect(secondButton.querySelector('ion-icon')?.getAttribute('icon')).toBe('save');
	});

	it('calls button handlers when fab list buttons are clicked', async () => {
		const button1Handler = vi.fn();
		const button2Handler = vi.fn();
		const properties = {
			buttons: [
				{
					handler: button1Handler,
					icon: 'share',
					label: 'Share'
				},
				{
					handler: button2Handler,
					icon: 'save',
					label: 'Save'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButtons = container.querySelectorAll('ion-fab-list ion-fab-button');

		await fireEvent.click(fabButtons[0]!);
		expect(button1Handler).toHaveBeenCalledTimes(1);
		expect(button2Handler).not.toHaveBeenCalled();

		await fireEvent.click(fabButtons[1]!);
		expect(button2Handler).toHaveBeenCalledTimes(1);
		expect(button1Handler).toHaveBeenCalledTimes(1);
	});

	it('invokes button handlers when pressing Enter on fab list buttons', async () => {
		const button1Handler = vi.fn();
		const button2Handler = vi.fn();
		const properties = {
			buttons: [
				{
					handler: button1Handler,
					icon: 'share',
					label: 'Share'
				},
				{
					handler: button2Handler,
					icon: 'save',
					label: 'Save'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButtons = container.querySelectorAll('ion-fab-list ion-fab-button');

		await fireEvent.keyDown(fabButtons[0]!, { key: 'Space' });
		expect(button1Handler).not.toHaveBeenCalled();

		await fireEvent.keyDown(fabButtons[0]!, { key: 'Enter' });
		expect(button1Handler).toHaveBeenCalledTimes(1);

		await fireEvent.keyDown(fabButtons[1]!, { key: 'Enter' });
		expect(button2Handler).toHaveBeenCalledTimes(1);
	});

	it('exposes button semantics (role and tabindex) for fab list buttons', () => {
		const properties = {
			buttons: [
				{
					handler: vi.fn(),
					icon: 'share',
					label: 'Share'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const fabButton = container.querySelector('ion-fab-list ion-fab-button');
		expect(fabButton?.getAttribute('role')).toBe('button');
		expect(fabButton?.getAttribute('tabindex')).toBe('0');
	});

	it('sets translucent attribute on main fab button and fab list buttons', () => {
		const properties = {
			buttons: [
				{
					handler: vi.fn(),
					icon: 'share',
					label: 'Share'
				}
			],
			clicked: vi.fn(),
			icon: 'add',
			label: 'Add Item'
		};
		const { container } = render(FabButton, { props: properties });

		const mainFabButton = container.querySelector('ion-fab > ion-fab-button');
		expect(mainFabButton?.hasAttribute('translucent')).toBe(true);

		const listFabButton = container.querySelector('ion-fab-list ion-fab-button');
		expect(listFabButton?.hasAttribute('translucent')).toBe(true);
	});
});
