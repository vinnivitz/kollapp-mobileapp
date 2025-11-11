import type { OrganizationRole, UserStatus } from '$lib/models/api';

export type PersonsOfOrganizationDto = {
	id: number;
	organizationRole: OrganizationRole;
	status: UserStatus;
	userId: number;
	username: string;
};
