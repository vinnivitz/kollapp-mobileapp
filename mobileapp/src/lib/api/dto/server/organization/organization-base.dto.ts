/**
 * Data Transfer Object for organization base information.
 */
export type OrganizationBaseDto = {
	id: number;
	name: string;
	place: string;
	description?: string;
};
