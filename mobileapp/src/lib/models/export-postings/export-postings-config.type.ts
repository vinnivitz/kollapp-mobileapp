import type { ActivityTO, OrganizationBudgetCategoryResponseTO, PersonOfOrganizationTO } from '@kollapp/api-types';

/**
 * Export context containing lookup data for postings
 */
export type ExportPostingsConfig = {
	activities: ActivityTO[];
	budgetCategories: OrganizationBudgetCategoryResponseTO[];
	organizationName: string;
	personsOfOrganization: PersonOfOrganizationTO[];
	title: string;
	personOfOrganizationName?: string;
} & ({ activityDate: string; activityName: string } | { activityDate?: never; activityName?: never });
