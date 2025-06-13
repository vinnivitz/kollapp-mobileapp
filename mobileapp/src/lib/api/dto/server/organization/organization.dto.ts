import type { UserRole, UserStatus } from '$lib/models/api';

/**
 * Organization DTO for retrieving basic organization information.
 */
export type OrganizationDto = {
	id: number;
	name: string;
	organizationInvitationCode: OrganizationInvitationCode;
	personsOfOrganization: PersonsOfOrganization[];
	place: string;
	description?: string;
};

type PersonsOfOrganization = { id: number; role: UserRole; status: UserStatus; username: string };

type OrganizationInvitationCode = {
	code: string;
	expirationDate: Date;
};
