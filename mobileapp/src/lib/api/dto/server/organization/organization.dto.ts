import type { UserRole } from '$lib/models/api';

/**
 * Organization DTO for retrieving basic organization information.
 */
export type OrganizationDto = {
	id: number;
	name: string;
	personsOfOrganization: PersonsOfOrganization[];
	place: string;
	description?: string;
};

type PersonsOfOrganization = { id: number; role: UserRole; username: string };
