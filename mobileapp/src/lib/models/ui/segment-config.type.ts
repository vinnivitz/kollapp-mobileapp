import type { Colors } from './colors.type';

export type SegmentConfig = {
	label: string;
	selected: boolean;
	class?: string;
	color?: Colors;
	icon?: string;
	indexed?: string;
	clicked: () => void;
};
