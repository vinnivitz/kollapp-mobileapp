import { type Config, driver, type DriveStep } from 'driver.js';
import { tick } from 'svelte';
import { get } from 'svelte/store';

import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { RouteId } from '$app/types';

import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { tourSelector, TourStepId } from '$lib/models/tour';
import { organizationStore } from '$lib/stores';
import { getStoredValue, hasOrganizationRole, storeValue } from '$lib/utility';

/** Maximum time to wait for an element to appear in the DOM (ms) */
const ELEMENT_WAIT_TIMEOUT = 3000;
/** Polling interval for element detection (ms) */
const ELEMENT_POLL_INTERVAL = 50;

const TOUR_STORAGE_KEY = StorageKey.TOUR_COMPLETED;

/**
 * Extended tour step with route information for cross-page navigation
 */
export interface TourStep extends Omit<DriveStep, 'element'> {
	/** CSS selector for the element to highlight */
	element: string;
	/** The route this step belongs to */
	route: RouteId;
}

/**
 * Check if the app tour has already been completed
 */
export async function isTourCompleted(): Promise<boolean> {
	return !!(await getStoredValue<boolean>(TOUR_STORAGE_KEY));
}

/**
 * Mark the tour as completed
 */
export async function markTourCompleted(): Promise<void> {
	await storeValue(TOUR_STORAGE_KEY, true);
}

/**
 * Reset the tour so it will show again
 */
export async function resetTour(): Promise<void> {
	await storeValue(TOUR_STORAGE_KEY, false);
}

/**
 * Get the tour configuration
 */
function getTourConfig(): Omit<Config, 'steps'> {
	const $t = get(t);

	return {
		allowClose: true,
		animate: true,
		doneBtnText: $t('utility.tour.done'),
		nextBtnText: $t('utility.tour.next'),
		overlayColor: 'rgba(0, 0, 0, 0.7)',
		popoverClass: 'kollapp-tour-popover',
		prevBtnText: $t('utility.tour.previous'),
		showProgress: true,
		stagePadding: 10,
		stageRadius: 8
	};
}

/**
 * Get all tour steps for the complete app tour
 */
function getAllTourSteps(): TourStep[] {
	const $t = get(t);
	const organization = get(organizationStore)!;
	const isManager = hasOrganizationRole('ROLE_ORGANIZATION_MANAGER');
	const hasActivities = organization?.activities.length > 0;

	return [
		{
			element: '',
			popover: {
				description: $t('utility.tour.steps.welcome.description'),
				title: $t('utility.tour.steps.welcome.title')
			},
			route: '/'
		},
		{
			element: 'ion-menu-button',
			popover: {
				align: 'start',
				description: $t('utility.tour.steps.menu.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.menu.title')
			},
			route: '/'
		},
		...(hasActivities
			? [
					{
						element: tourSelector(TourStepId.HOME.UPCOMING_ACTIVITY),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.upcoming-activity.description'),
							side: 'bottom' as const,
							title: $t('utility.tour.steps.upcoming-activity.title')
						},
						route: '/' as RouteId
					}
				]
			: []),
		{
			element: tourSelector(TourStepId.HOME.ORGANIZATION),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.organization.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.organization.title')
			},
			route: '/'
		},
		{
			element: tourSelector(TourStepId.HOME.QUICK_ACCESS),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.quick-access.description'),
				side: 'top',
				title: $t('utility.tour.steps.quick-access.title')
			},
			route: '/'
		},
		{
			element: tourSelector(TourStepId.HOME.BUDGET_CHART),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.budget.description'),
				side: 'top',
				title: $t('utility.tour.steps.budget.title')
			},
			route: '/'
		},
		{
			element: tourSelector(TourStepId.ORGANIZATION.INFO),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.org-info.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.org-info.title')
			},
			route: '/organization'
		},
		{
			element: tourSelector(TourStepId.ORGANIZATION.BUDGET),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.org-budget.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.org-budget.title')
			},
			route: '/organization'
		},
		...(hasActivities
			? [
					{
						element: tourSelector(TourStepId.ORGANIZATION.UPCOMING_ACTIVITY),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.org-upcoming-activity.description'),
							side: 'top' as const,
							title: $t('utility.tour.steps.org-upcoming-activity.title')
						},
						route: '/organization' as RouteId
					}
				]
			: []),
		{
			element: tourSelector(TourStepId.ORGANIZATION.ACTIVITIES),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.org-activities.description'),
				side: 'top',
				title: $t('utility.tour.steps.org-activities.title')
			},
			route: '/organization'
		},
		{
			element: tourSelector(TourStepId.ORGANIZATION.ORGANIZATION),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.org-organization.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.org-organization.title')
			},
			route: '/organization'
		},
		{
			element: tourSelector(TourStepId.ORGANIZATION.MISCELLANEOUS),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.org-misc.description'),
				side: 'top',
				title: $t('utility.tour.steps.org-misc.title')
			},
			route: '/organization'
		},
		{
			element: tourSelector(TourStepId.ACTIVITIES.SEGMENTS),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.activities-segments.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.activities-segments.title')
			},
			route: '/organization/activities'
		},
		{
			element: tourSelector(TourStepId.ACTIVITIES.LIST),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.activities-list.description'),
				side: 'top',
				title: $t('utility.tour.steps.activities-list.title')
			},
			route: '/organization/activities'
		},
		...(isManager
			? [
					{
						element: tourSelector(TourStepId.ACTIVITIES.CREATE),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.activities-fab.description'),
							side: 'left' as const,
							title: $t('utility.tour.steps.activities-fab.title')
						},
						route: '/organization/activities' as RouteId
					}
				]
			: []),
		...(isManager
			? [
					{
						element: tourSelector(TourStepId.BUDGET_CATEGORIES.LIST),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.budget-categories-list.description'),
							side: 'bottom' as const,
							title: $t('utility.tour.steps.budget-categories-list.title')
						},
						route: '/organization/budget-categories' as RouteId
					},
					{
						element: tourSelector(TourStepId.BUDGET_CATEGORIES.ADD),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.budget-categories-fab.description'),
							side: 'left' as const,
							title: $t('utility.tour.steps.budget-categories-fab.title')
						},
						route: '/organization/budget-categories' as RouteId
					}
				]
			: []),
		{
			element: tourSelector(TourStepId.MEMBERS.LIST),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.members-list.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.members-list.title')
			},
			route: '/organization/members'
		},
		...(isManager
			? [
					{
						element: tourSelector(TourStepId.MEMBERS.INVITE),
						popover: {
							align: 'center' as const,
							description: $t('utility.tour.steps.members-fab.description'),
							side: 'left' as const,
							title: $t('utility.tour.steps.members-fab.title')
						},
						route: '/organization/members' as RouteId
					}
				]
			: []),
		{
			element: tourSelector(TourStepId.ACCOUNT.PERSONAL),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.account-personal.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.account-personal.title')
			},
			route: '/account'
		},
		{
			element: tourSelector(TourStepId.ACCOUNT.APPLICATION),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.account-application.description'),
				side: 'top',
				title: $t('utility.tour.steps.account-application.title')
			},
			route: '/account'
		},
		{
			element: '',
			popover: {
				description: $t('utility.tour.steps.conclusion.description'),
				title: $t('utility.tour.steps.conclusion.title')
			},
			route: '/'
		}
	];
}

/**
 * Wait for the next animation frame (ensures paint has occurred)
 */
function nextFrame(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Wait for a specific element to appear in the DOM
 * @param selector - CSS selector for the element
 * @param timeout - Maximum time to wait (ms)
 * @returns true if element was found, false if timed out
 */
async function waitForElement(selector: string, timeout = ELEMENT_WAIT_TIMEOUT): Promise<boolean> {
	if (!selector) return true; // No element to wait for (e.g., welcome step)

	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		if (document.querySelector(selector)) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, ELEMENT_POLL_INTERVAL));
	}

	return false;
}

/**
 * Navigate to a route and wait for the DOM to be ready
 * Uses Svelte's tick() to ensure reactive updates are complete,
 * then waits for the next animation frame to ensure the DOM is painted
 */
async function navigateAndWait(route: RouteId): Promise<void> {
	if (page.url.pathname === route) return;

	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(route);

	await tick();

	await nextFrame();
	await nextFrame(); // Double frame for safety with transitions
}

/**
 * Convert TourStep to DriveStep (strip route property)
 */
function toDriverStep(step: TourStep): DriveStep {
	const { ...driverStep } = step;
	if (driverStep.element === '') {
		delete (driverStep as Partial<DriveStep>).element;
	}
	return driverStep as DriveStep;
}

/**
 * Create a driver instance with cross-page navigation support
 */
function createTourDriver(allSteps: TourStep[], onComplete: () => Promise<void>): ReturnType<typeof driver> {
	const driverSteps = allSteps.map((step) => toDriverStep(step));

	const driverObject = driver({
		...getTourConfig(),
		onDestroyStarted: async () => {
			await onComplete();
			driverObject.destroy();
		},
		onNextClick: async () => {
			const currentIndex = driverObject.getActiveIndex() ?? 0;
			const nextIndex = currentIndex + 1;
			const nextStep = allSteps[nextIndex];

			if (nextIndex < allSteps.length && nextStep) {
				const currentRoute = page.url.pathname;

				if (nextStep.route !== currentRoute) {
					driverObject.destroy();
					await navigateAndWait(nextStep.route);
					await continueTourFromStep(nextIndex, allSteps, onComplete);
					return;
				}
			}
			driverObject.moveNext();
		},
		onPrevClick: async () => {
			const currentIndex = driverObject.getActiveIndex() ?? 0;
			const previousIndex = currentIndex - 1;
			const previousStep = allSteps[previousIndex];

			if (previousIndex >= 0 && previousStep) {
				const currentRoute = page.url.pathname;

				if (previousStep.route !== currentRoute) {
					driverObject.destroy();
					await navigateAndWait(previousStep.route);
					await continueTourFromStep(previousIndex, allSteps, onComplete);
					return;
				}
			}
			driverObject.movePrevious();
		},
		steps: driverSteps
	});

	return driverObject;
}

/**
 * Continue the tour from a specific step index after navigation
 */
async function continueTourFromStep(
	stepIndex: number,
	allSteps: TourStep[],
	onComplete: () => Promise<void>
): Promise<void> {
	// Wait for Svelte's reactive updates
	await tick();
	await nextFrame();

	// Wait for the target element to be available
	const step = allSteps[stepIndex];
	if (step) {
		await waitForElement(step.element);
	}

	const driverObject = createTourDriver(allSteps, onComplete);
	driverObject.drive(stepIndex);
}

/**
 * Start the app tour
 * @param forceShow - If true, show the tour even if it was already completed
 * @param startFromCurrentPage - If true, starts from the current page's first step
 */
export async function startTour(forceShow = false, startFromCurrentPage = false): Promise<void> {
	if (!forceShow && (await isTourCompleted())) {
		return;
	}

	const allSteps = getAllTourSteps();
	let startIndex = 0;

	if (startFromCurrentPage) {
		const currentRoute = page.url.pathname;
		const pageStepIndex = allSteps.findIndex((step) => step.route === currentRoute);
		if (pageStepIndex !== -1) {
			startIndex = pageStepIndex;
		}
	}

	const firstStep = allSteps[startIndex];
	if (!firstStep) {
		return;
	}

	await navigateAndWait(firstStep.route);

	await waitForElement(firstStep.element);

	const driverObject = createTourDriver(allSteps, markTourCompleted);
	driverObject.drive(startIndex);
}

/**
 * Start the tour for a specific page/feature
 */
export function startFeatureTour(steps: DriveStep[]): void {
	const driverObject = driver({
		...getTourConfig(),
		steps
	});

	driverObject.drive();
}
