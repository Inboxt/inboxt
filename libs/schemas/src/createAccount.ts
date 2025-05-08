import { z } from './zod';

export const createAccountSchema = z.object({
	password: z.string().password(),
	emailAddress: z.string().email(),
	username: z
		.string()
		.regex(/^[a-zA-Z0-9](([._-](?![._-]))?[a-zA-Z0-9]){2,19}$/, {
			message:
				'Invalid username. Must be 3-20 characters, alphanumeric, and can include ".", "_", or "-".',
		}),
});
