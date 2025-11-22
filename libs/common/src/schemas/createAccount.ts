import { z } from './zod';

export const rules = {
	password: z.password(),
	emailAddress: z.email(),
	username: z.string().regex(/^[a-zA-Z0-9](([._-](?![._-]))?[a-zA-Z0-9]){2,19}$/, {
		error:
			'Invalid username. Must be 3-20 characters, alphanumeric, and can include ".", "_", or "-".',
	}),
};

export const createAccountSchema = z.object({
	...rules,
});
