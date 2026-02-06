import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import FadeInOut from '$lib/components/core/animation/FadeInOut.svelte';

const classList = 'fade-in-out';
const htmlContent = 'Content';

describe('FadeInOut', () => {
	it('renders children and applies classList', () => {
		const { container } = render(FadeInOut, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<div>${htmlContent}</div>` })),
				classList
			}
		});

		const childElement = container.querySelector('div');

		expect(childElement).toBeTruthy();
		expect(childElement?.className).toContain(classList);
		expect(childElement?.textContent).toBe(htmlContent);
	});

	it('renders with default empty classList', () => {
		const { container } = render(FadeInOut, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<span>Default</span>` }))
			}
		});

		const wrapperDiv = container.querySelector('div');

		expect(wrapperDiv).toBeTruthy();
		expect(wrapperDiv?.className).toBe('');
		expect(wrapperDiv?.textContent).toBe('Default');
	});
});
