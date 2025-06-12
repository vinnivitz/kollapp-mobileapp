import type { MemberModel } from './member-model.type';

/**
 * Stores basic information about an organization.
 */
export type OrganizationModel = {
	id: number;
	name: string;
	personsOfOrganization: MemberModel[];
	place: string;
	description?: string;
};
