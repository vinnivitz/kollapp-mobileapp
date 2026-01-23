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
		ACTIVITIES: generateTourId(),
		BUDGET: generateTourId(),
		INFO: generateTourId(),
		MISCELLANEOUS: generateTourId(),
		ORGANIZATION: generateTourId(),
		UPCOMING_ACTIVITY: generateTourId()
	}
} as const;

/**
 * Type for all valid tour step IDs
 */
type NestedValues<T> = T extends object
	? { [K in keyof T]: T[K] extends object ? NestedValues<T[K]> : T[K] }[keyof T]
	: T;

export type TourStepIdType = NestedValues<typeof TourStepId>;

/**
 * Creates a CSS selector for a tour step ID
 */
export function tourSelector(id: TourStepIdType): string {
	return `[data-tour="${id}"]`;
}

function generateTourId(): string {
	return `tour-step-${++tourIdCounter}`;
}
