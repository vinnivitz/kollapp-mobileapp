export type ConfirmModalConfig = {
	confirmText?: string;
	header?: string;
	message?: string;
	handler: () => Promise<void> | void;
};
