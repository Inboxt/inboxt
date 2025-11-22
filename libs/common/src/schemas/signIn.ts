import { z } from './zod';

export const signInSchema = z.object({
	password: z.string().min(1, 'Password is required'),
	emailAddress: z.email(),
});
