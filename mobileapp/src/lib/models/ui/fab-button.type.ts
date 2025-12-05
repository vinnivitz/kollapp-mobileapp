import type { Colors } from './colors.type';

/**
 * Model for a Floating Action Button (FAB) with multiple buttons.
 */
export type FabButtonButtons = {
	icon: string;
	label: string;
	color?: Colors;
	handler: () => void;
};
