import { z } from './zod.js';

export const rules = {
	name: z.string().min(1, 'Name is required').max(30, 'Name cannot exceed 30 characters'),
	query: z.string().min(1, 'Query is required').max(500, 'Query cannot exceed 500 characters'),
};

export const createSavedQuerySchema = z.object({
	...rules,
});
