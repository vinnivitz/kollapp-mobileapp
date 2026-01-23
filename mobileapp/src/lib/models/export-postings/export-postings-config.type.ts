import type { ActivityTO, OrganizationBudgetCategoryResponseTO, PersonOfOrganizationTO } from '@kollapp/api-types';

/**
 * Export context containing lookup data for postings
 */
export type ExportPostingsConfig = {
	activities: ActivityTO[];
	categories: OrganizationBudgetCategoryResponseTO[];
	members: PersonOfOrganizationTO[];
	organizationName: string;
	title: string;
	memberName?: string;
} & ({ activityDate: string; activityName: string } | { activityDate?: never; activityName?: never });
