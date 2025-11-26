import { z } from './zod.js';

export const requestPasswordRecoverySchema = z.object({
	emailAddress: z.email('Please enter a valid email address'),
});
