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

	BUDGET_STATISTICS: {
		CHARTS: generateTourId()
	},

	HOME: {
		BUDGET_CHART: generateTourId(),
		ORGANIZATION: generateTourId(),
		QUICK_ACCESS: generateTourId(),
		QUICK_ACCESS_PANEL: generateTourId(),
		UPCOMING_ACTIVITY: generateTourId()
	},

	MEMBERS: {
		INVITE: generateTourId(),
		LIST: generateTourId()
	},

	MENU: {
		ACTIVITIES: generateTourId()
	},

	NAVIGATION: {
		ACCOUNT_TAB: generateTourId(),
		MENU_BUTTON: generateTourId(),
		ORGANIZATION_TAB: generateTourId()
	},

	ORGANIZATION: {
		BUDGET: generateTourId(),
		BUDGET_CATEGORIES_LINK: generateTourId(),
		INFO: generateTourId(),
		MEMBERS_LINK: generateTourId(),
		STATISTICS_LINK: generateTourId()
	}
} as const;

function generateTourId(): string {
	return `tour-step-${++tourIdCounter}`;
}
