import { z } from './zod.js';

export const rules = {
	password: z.password(),
	emailAddress: z.email('Please enter a valid email address'),
	username: z.string().regex(/^[a-zA-Z0-9](([._-](?![._-]))?[a-zA-Z0-9]){2,19}$/, {
		error: 'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, or hyphens.',
	}),
};

export const createAccountSchema = z.object({
	...rules,
});
