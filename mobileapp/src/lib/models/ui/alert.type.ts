/**
 * Alert model for displaying messages.
 */
export type AlertConfig = {
	duration?: number;
	type?: AlertType;
};

/**
 * Enumeration of alert types based on ionic color names.
 */
export enum AlertType {
	ERROR = 'danger',
	SUCCESS = 'success'
}
