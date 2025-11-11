import type {
	ActivityDto,
	OrganizationBaseDto,
	PersonsOfOrganizationDto,
	PostingDto
} from '$lib/api/dto/server/organization';

/**
 * Data Transfer Object for organization information.
 */
export type OrganizationDto = OrganizationBaseDto & {
	activities: ActivityDto[];
	organizationInvitationCode: OrganizationInvitationCode;
	organizationPostings: PostingDto[];
	personsOfOrganization: PersonsOfOrganizationDto[];
};

type OrganizationInvitationCode = {
	code: string;
	expirationDate: string;
};
