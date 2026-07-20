import { z } from './zod.js';

export const updateSavedItemMetadataSchema = z.object({
	title: z.string().min(1, 'Please enter a title.').max(300, 'Title is too long.'),
	description: z.string().max(2000, 'Description is too long.').nullable().optional(),
	author: z.string().max(200, 'Author name is too long.').nullable().optional(),
});
