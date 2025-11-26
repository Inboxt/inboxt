import { z } from './zod.js';

export const createApiTokenSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Please provide a name for this token')
		.max(64, 'Token name is too long (max 64 chars)'),
	expiry: z.string().trim(),
});
