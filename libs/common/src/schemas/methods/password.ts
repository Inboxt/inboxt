import { z } from 'zod';

export const password = () =>
	z
		.string()
		.min(8)
		.refine(
			(val) =>
				/[A-Z]/.test(val) &&
				/[a-z]/.test(val) &&
				/[0-9]/.test(val) &&
				/[!@#$%^&*]/.test(val),
			{
				error: 'Password must contain uppercase, lowercase, number, and special character.',
			},
		);
