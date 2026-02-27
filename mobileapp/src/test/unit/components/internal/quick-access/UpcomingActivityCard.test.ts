import { TZDate } from '@date-fns/tz/date';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import UpcomingActivityWidget from '$lib/components/internal/quick-access/UpcomingActivityCard.svelte';

class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const futureDate = new TZDate();
futureDate.setDate(futureDate.getDate() + 7);

const mockActivity = {
	activityPostings: [{ id: 1 }, { id: 2 }],
	date: futureDate.toISOString(),
	id: 1,
	name: 'Test Activity'
};

describe('widgets/quick-access/widgets/UpcomingActivityWidget', () => {
	it('renders activity name when activity provided', () => {
		const { container } = render(UpcomingActivityWidget, {
			props: { activity: mockActivity as never, editMode: false }
		});
		expect(container.textContent).toContain('Test Activity');
	});

	it('shows no activity message when no activity', () => {
		const { container } = render(UpcomingActivityWidget, {
			props: { editMode: false }
		});
		// Should show the no-upcoming-activity message
		const note = container.querySelector('ion-note.italic');
		expect(note).toBeTruthy();
	});

	it('navigates to activity when clicked in normal mode', async () => {
		const { container } = render(UpcomingActivityWidget, {
			props: { activity: mockActivity as never, editMode: false }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).toHaveBeenCalled();
	});

	it('does not navigate when in edit mode', async () => {
		vi.clearAllMocks();
		const { container } = render(UpcomingActivityWidget, {
			props: { activity: mockActivity as never, editMode: true }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).not.toHaveBeenCalled();
	});

	it('navigates to activities list when no activity and clicked', async () => {
		const { container } = render(UpcomingActivityWidget, {
			props: { editMode: false }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).toHaveBeenCalled();
	});

	it('shows arrow icon when not in edit mode', () => {
		const { container } = render(UpcomingActivityWidget, {
			props: { activity: mockActivity as never, editMode: false }
		});
		const icons = container.querySelectorAll('ion-card-title ion-icon');
		expect(icons.length).toBe(2);
	});
});
