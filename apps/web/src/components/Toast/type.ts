import { ToastT } from 'sonner';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastProps extends Omit<ToastT, 'richColors'> {
	title?: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	variant?: ToastVariant;
}
