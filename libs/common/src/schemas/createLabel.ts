import { z } from './zod';

export const rules = {
	name: z.string().nonempty().max(30),
	color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: 'Color must be a valid hex code (e.g., #fff or #ffffff).',
	}),
};

export const createLabelSchema = z.object({
	...rules,
});
