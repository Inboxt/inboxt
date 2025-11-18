import { z } from './zod';

export const createApiTokenSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(64, 'Name is too long'),
	expiresAt: z.date().optional().nullable(),
});
