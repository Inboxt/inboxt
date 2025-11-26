import { z } from 'zod';

export const password = () =>
	z
		.string()
		.min(8, 'Password must be at least 8 characters long.')
		.refine(
			(val) =>
				/[A-Z]/.test(val) &&
				/[a-z]/.test(val) &&
				/[0-9]/.test(val) &&
				/[!@#$%^&*]/.test(val),
			{
				error: 'Password needs an uppercase letter, lowercase letter, number, and special character.',
			},
		);
