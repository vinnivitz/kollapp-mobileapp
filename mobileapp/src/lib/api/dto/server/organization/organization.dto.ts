import type { OrganizationRole, UserStatus } from '$lib/models/api';
import type { ActivityDto } from './activity.dto';

/**
 * Data Transfer Object for organization information.
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

type PersonsOfOrganization = {
	id: number;
	organizationRole: OrganizationRole;
	status: UserStatus;
	userId: number;
	username: string;
};

type OrganizationInvitationCode = {
	code: string;
	expirationDate: Date;
};
