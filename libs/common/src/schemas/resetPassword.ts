import { z } from './zod';

export const resetPasswordSchema = z.object({
	password: z.password(),
	code: z.verificationCode(),
	emailAddress: z.email(),
});
