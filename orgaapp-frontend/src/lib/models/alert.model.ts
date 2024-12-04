export type AlertModel = {
	message: string;
	type: AlertType;
};

export enum AlertType {
	INFO = 'success',
	ERROR = 'danger'
}
