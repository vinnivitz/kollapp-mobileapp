import type { OrganizationRole } from '$lib/models/api';

export type MemberModel = {
	id: number;
	organizationRole: OrganizationRole;
	userId: number;
	username: string;
};
