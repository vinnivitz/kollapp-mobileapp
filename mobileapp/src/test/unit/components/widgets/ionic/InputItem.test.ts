import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';

describe('CustomItemInput Component', () => {
	it('renders label and children content', () => {
		const childHtml = '<ion-input data-testid="inner-input" value="john@doe.com"></ion-input>';
		const children = createRawSnippet(() => ({ render: () => childHtml }));

		const properties = {
			children,
			clicked: vi.fn(),
			icon: 'mail-outline',
			label: 'Email',
			name: 'email'
		};

		const { container, getByTestId } = render(InputItem, { props: properties });
		const label = container.querySelector('ion-text');

		expect(label).toBeTruthy();
		expect(label?.textContent?.trim()).toBe('Email');
		expect(getByTestId('inner-input')).toBeTruthy();
	});

	it('accepts optional flags without throwing', () => {
		const children = createRawSnippet(() => ({ render: () => '<div>child</div>' }));

		const properties = {
			children,
			classList: 'extra-class',
			clicked: vi.fn(),
			disabled: true,
			icon: 'help',
			label: 'Whatever',
			name: 'ignored-prop'
		};

		const { container } = render(InputItem, { props: properties });
		expect(container.querySelector('ion-text')?.textContent?.trim()).toBe('Whatever');
	});
});
