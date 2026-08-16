import { rules } from './createSavedQuery.js';
import { z } from './zod.js';

export const updateSavedQuerySchema = z.object({
	...rules,
});
