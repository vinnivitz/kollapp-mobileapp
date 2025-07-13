import type { ActivityModel, InvitationCodeModel, MemberModel } from '$lib/models/models';

/**
 * Stores information about an organization.
 */
export type OrganizationModel = {
	activities: ActivityModel[];
	id: number;
	name: string;
	organizationInvitationCode: InvitationCodeModel;
	personsOfOrganization: MemberModel[];
	place: string;
	description?: string;
};
