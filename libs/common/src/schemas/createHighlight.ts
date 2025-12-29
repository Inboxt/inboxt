import { z } from 'zod';

const segmentSchema = z
	.object({
		xpath: z.string().min(1).max(2000),
		startOffset: z.number().int().min(0),
		endOffset: z.number().int().min(0),
		text: z.string().max(50_000).optional(),
		beforeText: z.string().min(0).max(50_000),
		afterText: z.string().min(0).max(50_000),
	})
	.refine((s) => s.endOffset >= s.startOffset, {
		message: 'endOffset must be >= startOffset',
		path: ['endOffset'],
	});

export const createHighlightSchema = z.object({
	savedItemId: z.string().min(1).max(100),
	segments: z.array(segmentSchema).min(1).max(100),
});
