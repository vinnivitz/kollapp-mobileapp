import { type Config, driver, type DriveStep } from 'driver.js';
import { tick } from 'svelte';
import { get } from 'svelte/store';

import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { RouteId } from '$app/types';

import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { TourStepId } from '$lib/models/ui';
import { organizationStore } from '$lib/stores';
import { getStoredValue, hasOrganizationRole, storeValue } from '$lib/utility';

const ELEMENT_WAIT_TIMEOUT = 3000;
const ELEMENT_POLL_INTERVAL = 50;

/**
 * Navigation click sequence for tour steps
 */
export interface ClickSequence {
	/** CSS selector for the element to click */
	selector: string;
	/** Wait time after clicking before next action (ms) */
	waitAfter?: number;
	/** Whether to wait for navigation to complete */
	waitForNavigation?: boolean;
}

/**
 * Extended tour step with route information for cross-page navigation
 */
export interface TourStep extends Omit<DriveStep, 'element'> {
	/** CSS selector for the element to highlight */
	element: string;
	/** The route this step belongs to */
	route: RouteId;
	/** Click sequence to execute before showing this step (for navigation context) */
	clickSequence?: ClickSequence[];
	/** Condition function to determine if step should be shown */
	condition?: () => boolean;
}

/**
 * Check if the app tour has already been completed
 */
export async function isTourCompleted(): Promise<boolean> {
	return !!(await getStoredValue<boolean>(StorageKey.TOUR_COMPLETED));
}

/**
 * Mark the tour as completed
 */
export async function markTourCompleted(): Promise<void> {
	await storeValue(StorageKey.TOUR_COMPLETED, true);
}

/**
 * Reset the tour so it will show again
 */
export async function resetTour(): Promise<void> {
	await storeValue(StorageKey.TOUR_COMPLETED, false);
}

/**
 * Creates a CSS selector for a tour step ID
 * @param id - The tour step ID
 * @returns CSS selector string
 */
export function tourSelector(id: string): string {
	return `[data-tour="${id}"]`;
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

function getTotalPostingsCount(): number {
	const organization = get(organizationStore);
	if (!organization) return 0;

	const organizationPostings = organization.organizationPostings?.length ?? 0;
	const activityPostings =
		organization.activities?.reduce((total, act) => total + (act.activityPostings?.length ?? 0), 0) ?? 0;

	return organizationPostings + activityPostings;
}

function getAllTourSteps(): TourStep[] {
	const $t = get(t);
	const isManager = hasOrganizationRole('ROLE_ORGANIZATION_MANAGER');

	const allSteps: TourStep[] = [
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
			clickSequence: [{ selector: tourSelector(TourStepId.NAVIGATION.ORGANIZATION_TAB), waitForNavigation: true }],
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
		{
			clickSequence: [
				{ selector: 'ion-menu-button', waitAfter: 500 },
				{ selector: tourSelector(TourStepId.MENU.STATISTICS), waitForNavigation: true }
			],
			condition: () => getTotalPostingsCount() > 0,
			element: tourSelector(TourStepId.BUDGET_STATISTICS.CHARTS),
			popover: {
				align: 'center',
				description: $t('utility.tour.steps.budget-statistics.description'),
				side: 'bottom',
				title: $t('utility.tour.steps.budget-statistics.title')
			},
			route: '/organization/budget-statistics'
		},
		{
			clickSequence: [
				{ selector: 'ion-menu-button', waitAfter: 500 },
				{ selector: tourSelector(TourStepId.MENU.ACTIVITIES), waitForNavigation: true }
			],
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
						clickSequence: [
							{ selector: 'ion-menu-button', waitAfter: 500 },
							{ selector: tourSelector(TourStepId.MENU.BUDGET_CATEGORIES), waitForNavigation: true }
						],
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
			clickSequence: [
				{ selector: 'ion-menu-button', waitAfter: 500 },
				{ selector: tourSelector(TourStepId.MENU.MEMBERS), waitForNavigation: true }
			],
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
			clickSequence: [{ selector: tourSelector(TourStepId.NAVIGATION.ACCOUNT_TAB), waitForNavigation: true }],
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

	return allSteps.filter((step) => !step.condition || step.condition());
}

async function highlightAndClick(selector: string): Promise<void> {
	const element = document.querySelector<HTMLElement>(selector);
	if (!element) return;

	element.scrollIntoView({ behavior: 'smooth', block: 'center' });
	await new Promise((resolve) => setTimeout(resolve, 300));

	const highlightDriver = driver({
		allowClose: false,
		animate: true,
		overlayColor: 'rgba(0, 0, 0, 0.7)',
		showButtons: [],
		stagePadding: 10,
		stageRadius: 8
	});

	highlightDriver.highlight({
		element: selector,
		popover: undefined
	});

	element.classList.add('tour-click-highlight');

	await new Promise((resolve) => setTimeout(resolve, 1200));

	highlightDriver.destroy();

	element.classList.remove('tour-click-highlight');

	await new Promise((resolve) => setTimeout(resolve, 100));

	element.click();
}

async function waitForElement(selector: string, timeout = ELEMENT_WAIT_TIMEOUT): Promise<boolean> {
	if (!selector) return true;

	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		if (document.querySelector(selector)) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, ELEMENT_POLL_INTERVAL));
	}

	return false;
}

async function navigateAndWait(route: RouteId): Promise<void> {
	if (page.url.pathname === route) return;

	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(route);

	await tick();

	await tick();
}

function toDriverStep(step: TourStep): DriveStep {
	const { ...driverStep } = step;
	if (driverStep.element === '') {
		delete (driverStep as Partial<DriveStep>).element;
	}
	return driverStep as DriveStep;
}

async function executeClickSequence(sequence: ClickSequence[]): Promise<void> {
	for (const click of sequence) {
		await waitForElement(click.selector);

		await highlightAndClick(click.selector);

		if (click.waitAfter) {
			await new Promise((resolve) => setTimeout(resolve, click.waitAfter));
		}

		if (click.waitForNavigation) {
			await tick();
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}
}

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

				if (nextStep.route !== currentRoute || nextStep.clickSequence) {
					driverObject.destroy();

					// Execute click sequence if defined
					if (nextStep.clickSequence && nextStep.clickSequence.length > 0) {
						await executeClickSequence(nextStep.clickSequence);
					}

					// Navigate if not already there (click sequence might have navigated)
					if (page.url.pathname !== nextStep.route) {
						await navigateAndWait(nextStep.route);
					}

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

async function continueTourFromStep(
	stepIndex: number,
	allSteps: TourStep[],
	onComplete: () => Promise<void>
): Promise<void> {
	await tick();

	const step = allSteps[stepIndex];
	if (step) {
		await waitForElement(step.element);
	}

	const driverObject = createTourDriver(allSteps, onComplete);
	driverObject.drive(stepIndex);
}
