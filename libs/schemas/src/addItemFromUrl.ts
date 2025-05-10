import { z } from './zod';

export const addItemFromUrlSchema = z.object({
	url: z.string().url(),
});
