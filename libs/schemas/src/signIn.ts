import { z } from './zod';

export const signInSchema = z.object({
	password: z.string().password(),
	emailAddress: z.string().email(),
});
