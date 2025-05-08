import { z } from 'zod';

export const password = () => {
	return z
		.string()
		.min(8)
		.superRefine((val, ctx) => {
			if (!/[A-Z]/.test(val)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						'Password must contain at least one uppercase letter.',
				});
			}
			if (!/[a-z]/.test(val)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						'Password must contain at least one lowercase letter.',
				});
			}
			if (!/[0-9]/.test(val)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Password must contain at least one number.',
				});
			}
			if (!/[!@#$%^&*]/.test(val)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						'Password must contain at least one special character (!@#$%^&*).',
				});
			}
		});
};
