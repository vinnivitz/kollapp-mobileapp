/**
 * Alert model for displaying messages.
 */
export type AlertConfig = {
	type?: AlertType;
	duration?: number;
};

/**
 * Enumeration of alert types based on ionic color names.
 */
export enum AlertType {
	SUCCESS = 'success',
	ERROR = 'danger'
}
