/**
 * Alert model for displaying messages.
 */
export type AlertModel = {
	message: string;
	type: AlertType;
	duration?: number;
};

/**
 * Enumeration of alert types based on ionic color names.
 */
export enum AlertType {
	INFO = 'success',
	ERROR = 'danger'
}
