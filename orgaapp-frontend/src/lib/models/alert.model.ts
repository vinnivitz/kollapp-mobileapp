/**
 * Alert model for displaying messages to the user.
 */
export type AlertModel = {
	message: string;
	type: AlertType;
};

/**
 * Enumeration of alert types based on ionic color names.
 */
export enum AlertType {
	INFO = 'success',
	ERROR = 'danger'
}
