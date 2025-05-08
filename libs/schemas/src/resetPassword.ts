import { z } from './zod';

export const resetPasswordSchema = z.object({
	password: z.string().password(),
	code: z.string().verificationCode(),
	emailAddress: z.string().email(),
});
