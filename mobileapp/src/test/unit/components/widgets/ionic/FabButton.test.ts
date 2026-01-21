import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';

describe('widgets/ionic/FabButton', () => {
	it('fires main click and renders list items', async () => {
		const clicked = vi.fn();
		const childHandler = vi.fn();
		const { container } = render(FabButton, {
			props: {
				buttons: [{ handler: childHandler, icon: 'a', label: 'A' }],
				clicked,
				icon: 'add'
			}
		});
		const main = container.querySelector('ion-fab-button:not([aria-label])')!;
		await fireEvent.click(main);
		expect(clicked).toHaveBeenCalled();
		const child = container.querySelector('ion-fab-list ion-fab-button')!;
		await fireEvent.click(child);
		expect(childHandler).toHaveBeenCalled();
	});

	it('Enter key triggers handlers for main and child buttons', async () => {
		const clicked = vi.fn();
		const childHandler = vi.fn();
		const { container } = render(FabButton, {
			props: { buttons: [{ handler: childHandler, icon: 'a', label: 'A' }], clicked, icon: 'add' }
		});
		const main = container.querySelector('ion-fab-button:not([aria-label])')!;
		await fireEvent.keyDown(main, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
		const child = container.querySelector('ion-fab-list ion-fab-button')!;
		await fireEvent.keyDown(child, { key: 'Enter' });
		expect(childHandler).toHaveBeenCalled();

		cleanup();
		const rendered2 = render(FabButton, { props: { clicked, icon: 'add' } });
		expect(rendered2.container.querySelector('ion-fab-list')).toBeNull();
	});

	it('renders with custom position', () => {
		const { container } = render(FabButton, {
			props: { horizontal: 'start', icon: 'add', vertical: 'top' }
		});

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('vertical')).toBe('top');
		expect(fab?.getAttribute('horizontal')).toBe('start');
	});

	it('renders with custom color', () => {
		const { container } = render(FabButton, {
			props: { color: 'danger', icon: 'add' }
		});

		const fabButton = container.querySelector('ion-fab-button');
		expect(fabButton?.getAttribute('color')).toBe('danger');
	});

	it('renders with custom classList', () => {
		const { container } = render(FabButton, {
			props: { classList: 'my-custom-fab', icon: 'add' }
		});

		const fab = container.querySelector('ion-fab');
		expect(fab?.classList.contains('my-custom-fab')).toBe(true);
	});

	it('does not trigger click on non-Enter key', async () => {
		const clicked = vi.fn();
		const { container } = render(FabButton, {
			props: { clicked, icon: 'add' }
		});

		const main = container.querySelector('ion-fab-button')!;
		await fireEvent.keyDown(main, { key: 'Space' });
		expect(clicked).not.toHaveBeenCalled();
	});

	it('renders with indexLabel and indexedLabel', () => {
		const { container } = render(FabButton, {
			props: { icon: 'add', indexedLabel: 'Main FAB button', indexLabel: 'fab-id' }
		});

		const fab = container.querySelector('ion-fab');
		expect(fab?.getAttribute('id')).toBe('fab-id');
		expect(fab?.getAttribute('aria-label')).toBe('Main FAB button');
	});

	it('renders button with custom color in fab list', async () => {
		const childHandler = vi.fn();
		const { container } = render(FabButton, {
			props: {
				buttons: [{ color: 'tertiary', handler: childHandler, icon: 'edit', label: 'Edit' }],
				icon: 'add'
			}
		});

		const child = container.querySelector('ion-fab-list ion-fab-button');
		expect(child?.getAttribute('color')).toBe('tertiary');
	});
});
