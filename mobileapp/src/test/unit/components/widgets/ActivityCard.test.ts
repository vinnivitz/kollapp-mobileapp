import type { ActivityModel } from '$lib/models/models';

import { fireEvent, render } from '@testing-library/svelte';
import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import ActivityCard from '$lib/components/widgets/ActivityCard.svelte';

describe('ActivityCard', () => {
	const activity: ActivityModel = {
		id: 1,
		location: 'Test Location',
		name: 'Test Activity'
	};

	it('renders activity details correctly', () => {
		const properties = { value: activity };
		const { container } = render(ActivityCard, { props: properties });
		const formattedDate = format(new Date(), 'PPP');

		const ionCardContent = container.querySelector('ion-card-content');

		expect(ionCardContent?.textContent).toContain(activity.name);
		expect(ionCardContent?.textContent).toContain(activity.location);
		expect(ionCardContent?.textContent).toContain(formattedDate);
	});

	it('calls the edit callback when the card is clicked', async () => {
		const editMock = vi.fn();
		const properties = { edit: editMock, value: activity };
		const { queryByText } = render(ActivityCard, { props: properties });

		const clickableElement = queryByText(activity.name);
		await fireEvent.click(clickableElement as HTMLElement);

		expect(editMock).toHaveBeenCalledWith(activity);
	});
});
