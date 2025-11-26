/**
 * Release Notes Model represents the structure of release notes
 */
export type ReleaseNotesTO = {
	changes: string[];
	date: string;
	version: string;
};
