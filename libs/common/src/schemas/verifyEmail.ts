import { z } from './zod.js';

export const verifyEmailSchema = z.object({
	code: z.verificationCode(),
});
