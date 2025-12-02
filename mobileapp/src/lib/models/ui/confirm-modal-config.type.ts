export type ConfirmModalConfig = {
	header: string;
	message: string;
	confirmText?: string;
	handler: () => Promise<void> | void;
};
