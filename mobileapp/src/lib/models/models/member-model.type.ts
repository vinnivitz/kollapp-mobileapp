import type { UserRole } from '$lib/models/api';

export type MemberModel = {
	id: number;
	role: UserRole;
	userId: number;
	username: string;
};
