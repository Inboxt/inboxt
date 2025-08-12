import { z } from './zod';

export const deleteAccountSchema = z.object({
	emailAddress: z.string().email(),
});
