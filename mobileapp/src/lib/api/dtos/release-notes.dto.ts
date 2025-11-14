/**
 * Release Notes Model represents the structure of release notes
 */
export type ReleaseNotesDto = {
	changes: string[];
	date: string;
	version: string;
};
