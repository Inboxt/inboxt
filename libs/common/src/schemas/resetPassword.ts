import { z } from './zod.js';

export const resetPasswordSchema = z.object({
	password: z.password(),
	code: z.verificationCode(),
	emailAddress: z.email(),
});
