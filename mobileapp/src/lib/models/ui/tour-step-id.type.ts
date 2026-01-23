let tourIdCounter = 0;

/**
 * Tour steps - Typed constants for all tour-able elements in the app.
 * Use these IDs in the `tourId` property of components.
 */
export const TourStepId = {
	ACCOUNT: {
		APPLICATION: generateTourId(),
		PERSONAL: generateTourId()
	},

	ACTIVITIES: {
		CREATE: generateTourId(),
		LIST: generateTourId(),
		SEGMENTS: generateTourId()
	},

	BUDGET_CATEGORIES: {
		ADD: generateTourId(),
		LIST: generateTourId()
	},

	HOME: {
		BUDGET_CHART: generateTourId(),
		ORGANIZATION: generateTourId(),
		QUICK_ACCESS: generateTourId(),
		UPCOMING_ACTIVITY: generateTourId()
	},

	MEMBERS: {
		INVITE: generateTourId(),
		LIST: generateTourId()
	},

	ORGANIZATION: {
		BUDGET: generateTourId(),
		INFO: generateTourId()
	}
} as const;

function generateTourId(): string {
	return `tour-step-${++tourIdCounter}`;
}
