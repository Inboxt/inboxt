import { z } from './zod.js';

export const addItemFromUrlSchema = z.object({
	url: z.url(),
});
