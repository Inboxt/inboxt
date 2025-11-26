import { z } from './zod.js';

export const rules = {
	name: z
		.string()
		.min(1, 'Label name is required')
		.max(30, 'Label name cannot exceed 30 characters'),
	color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		error: 'Color must be a valid hex code (e.g., #fff or #ffffff).',
	}),
};

export const createLabelSchema = z.object({
	...rules,
});
