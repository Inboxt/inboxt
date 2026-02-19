import { z } from 'zod';

export const inboundEmailSchema = z.object({
	eventId: z.string().min(1).optional(),
	messageId: z.string().min(1).optional(),
	recipient: z.email().optional(),
	from: z.string().optional(),
	subject: z.string().optional(),
	html: z.string().optional(),
	text: z.string().optional(),
	unsubscribeUrl: z.string().optional(),
});
