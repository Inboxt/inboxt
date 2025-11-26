import { z } from './zod.js';

export const deleteAccountSchema = z.object({
	emailAddress: z.email(),
});
