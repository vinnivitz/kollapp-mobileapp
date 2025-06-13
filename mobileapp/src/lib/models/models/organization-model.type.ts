import type { InvitationCodeModel, MemberModel } from '$lib/models/models';

/**
 * Stores basic information about an organization.
 */
export type OrganizationModel = {
	id: number;
	name: string;
	organizationInvitationCode: InvitationCodeModel;
	personsOfOrganization: MemberModel[];
	place: string;
	description?: string;
};
