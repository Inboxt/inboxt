import { z } from 'zod';

export const notificationTypeSchema = z.enum(['UPDATE', 'INCIDENT', 'INCIDENT_RESOLVED']);

export const notificationItemSchema = z.object({
	type: notificationTypeSchema,
	text: z.string().min(1),
	badge: z.string().optional(),
	date: z.string().optional(), // ISO date string
	link: z.url().optional(),
});

export const notificationsSchema = z.array(notificationItemSchema);
