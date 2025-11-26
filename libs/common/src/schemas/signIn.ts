import { z } from './zod.js';

export const signInSchema = z.object({
	password: z.string().min(1, 'Password is required'),
	emailAddress: z.email('Please enter a valid email address'),
});
