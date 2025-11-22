import { z } from './zod';

export const verifyEmailSchema = z.object({
	code: z.verificationCode(),
});
