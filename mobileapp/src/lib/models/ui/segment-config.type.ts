import type { Colors } from '$lib/models/ui';

export type SegmentConfig = {
	label: string;
	selected: boolean;
	class?: string;
	color?: Colors;
	icon?: string;
	indexed?: string;
	clicked: () => void;
};
