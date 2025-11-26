import { z } from './zod.js';

export const createApiTokenSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(64, 'Name is too long'),
	expiry: z.string().trim(),
});
