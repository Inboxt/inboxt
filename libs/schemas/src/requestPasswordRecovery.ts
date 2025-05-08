import { z } from './zod';

export const requestPasswordRecoverySchema = z.object({
	emailAddress: z.string().email(),
});
