import { toast as sonnerToast, type ExternalToast } from 'sonner';

import { CustomToast } from './CustomToast';
import { ToastProps } from './type';

export function toast(input: Omit<ToastProps, 'id'>) {
	const { title, description, action, variant, ...options } = input;

	return sonnerToast.custom(
		(id) => (
			<CustomToast
				id={id}
				title={title}
				description={description}
				action={action}
				variant={variant}
			/>
		),
		options as ExternalToast,
	);
}

export function toastSuccess(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({
		...opts,
		title: opts.title || 'Success',
		variant: 'success',
		duration: opts?.action ? 5000 : opts?.duration,
	});
}
export function toastError(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Error', variant: 'error' });
}
export function toastInfo(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({
		...opts,
		title: opts.title || 'Info',
		variant: 'info',
		duration: opts?.duration || 5000,
	});
}
export function toastWarning(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Warning', variant: 'warning' });
}
export function toastLoading(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Loading', variant: 'loading' });
}
