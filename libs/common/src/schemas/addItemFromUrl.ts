import { z } from './zod.js';

export const addItemFromUrlSchema = z.object({
	url: z.url('Please enter a valid URL (e.g., https://example.com)'),
	labelIds: z.array(z.string()).optional(),
});
