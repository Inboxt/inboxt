import { z } from 'zod';

const ALLOWED_MAILEROO_HOSTS = new Set(['inbound-api.maileroo.net']);

const mailerooUrlSchema = z.url().refine((raw) => {
	const u = new URL(raw);
	return u.protocol === 'https:' && ALLOWED_MAILEROO_HOSTS.has(u.hostname);
}, 'URL must be https and on an allowed Maileroo host');

const headersSchema = z.record(z.string(), z.array(z.string()));

const emailBodySchema = z.object({
	plaintext: z.string().optional(),
	stripped_plaintext: z.string().optional(),
	html: z.string().optional(),
	stripped_html: z.string().optional(),
	other_parts: z.any().optional(),
	raw_mime: z
		.object({
			url: z.url(),
			size: z.number().int().nonnegative(),
		})
		.optional(),
});

export const inboundEmailEventSchema = z.object({
	_id: z.string().min(1),
	message_id: z.string().min(1),

	domain: z.string().min(1).optional(),
	envelope_sender: z.string().min(1).optional(),

	recipients: z.array(z.string()).min(1),
	headers: headersSchema,
	body: emailBodySchema,

	spf_result: z.string().optional(),
	dkim_result: z.boolean().optional(),
	is_dmarc_aligned: z.boolean().optional(),
	is_spam: z.boolean().optional(),

	deletion_url: mailerooUrlSchema.optional(),
	validation_url: mailerooUrlSchema,

	processed_at: z.number().int().optional(),
});
