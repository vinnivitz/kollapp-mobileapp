import type { UserRole } from '$lib/models/api';

export type MemberModel = {
	id: number;
	role: UserRole;
	username: string;
};
