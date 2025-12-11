import { z } from './zod.js';

export const addArticleFromHtmlSnapshotSchema = z.object({
	url: z.url('Please enter a valid URL (e.g., https://example.com)'),
	html: z
		.string()
		.min(200, 'HTML content is too short to process. Please try saving a different page.')
		.max(
			1_000_000,
			'HTML content is too large to process from the extension. Try saving the link directly from the website instead.',
		),
});
