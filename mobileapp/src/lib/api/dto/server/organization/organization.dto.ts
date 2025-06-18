import type { UserRole, UserStatus } from '$lib/models/api';
import type { ActivityDto } from './activity.dto';

/**
 * Organization DTO for retrieving basic organization information.
 */
export type OrganizationDto = {
	activities: ActivityDto[];
	id: number;
	name: string;
	organizationInvitationCode: OrganizationInvitationCode;
	personsOfOrganization: PersonsOfOrganization[];
	place: string;
	description?: string;
};

type PersonsOfOrganization = { id: number; role: UserRole; status: UserStatus; userId: number; username: string };

type OrganizationInvitationCode = {
	code: string;
	expirationDate: Date;
};
