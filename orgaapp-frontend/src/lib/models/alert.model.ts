export type AlertModel = {
	message: string;
	type: AlertType;
	icon?: string;
};

export enum AlertType {
	INFO = 'info',
	ERROR = 'error'
}
