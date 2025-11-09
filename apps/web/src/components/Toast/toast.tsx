import { toast as sonnerToast } from 'sonner';

import { CustomToast } from './CustomToast';
import { ToastProps } from './type';

export function toast(input: Omit<ToastProps, 'id'>) {
	return sonnerToast.custom((id) => <CustomToast {...input} id={id} />);
}

export function toastSuccess(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({
		...opts,
		title: opts.title || 'Success',
		variant: 'success',
		duration: opts?.action ? 8000 : opts?.duration,
	});
}
export function toastError(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Error', variant: 'error' });
}
export function toastInfo(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({
		...opts,
		title: opts.title || 'Error',
		variant: 'info',
		duration: opts?.duration || 6500,
	});
}
export function toastWarning(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Error', variant: 'warning' });
}
export function toastLoading(opts: Partial<Omit<ToastProps, 'id' | 'variant'>>) {
	return toast({ ...opts, title: opts.title || 'Error', variant: 'loading' });
}
