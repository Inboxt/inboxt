import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { MAX_NEWSLETTER_WORD_COUNT, MIN_NEWSLETTER_WORD_COUNT } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';
import { ContentExtractionService } from '~services/content-extraction.service';

export type ProcessNewsletterInput = {
	html: string;
	text?: string;
};

@Injectable()
export class NewsletterService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly contentExtractionService: ContentExtractionService,
	) {}

	extractRecipient(payload: any): string | null {
		if (payload.recipient) {
			return payload.recipient;
		}

		if (payload.rcpt_to) {
			return payload.rcpt_to;
		}

		if (payload.Recipient) {
			return payload.Recipient;
		}

		if (payload.OriginalRecipient) {
			return payload.OriginalRecipient;
		}

		const recipients = payload.Recipients || payload.items?.[0]?.Recipients;
		if (Array.isArray(recipients) && recipients[0]) {
			return recipients[0];
		}

		if (payload.msys?.relay_message?.rcpt_to) {
			return payload.msys.relay_message.rcpt_to;
		}

		if (payload.ToFull?.length) {
			return payload.ToFull[0].Email;
		}

		const toAddresses: string[] = payload.recipients?.length
			? payload.recipients
			: (payload.headers?.To ?? []);

		return toAddresses?.[0] ?? payload.To ?? null;
	}

	extractSubject(payload: any): string | null {
		return (
			payload.subject ||
			payload.Subject ||
			payload.items?.[0]?.Subject ||
			payload.msys?.relay_message?.content?.subject ||
			payload.headers?.Subject?.[0] ||
			null
		);
	}

	extractMessageId(payload: any): string | null {
		return (
			payload.messageId ||
			payload.message_id ||
			payload.MessageID ||
			payload.MessageId ||
			payload.items?.[0]?.MessageId ||
			payload.msys?.relay_message?.content?.['Message-ID'] ||
			payload.headers?.['Message-ID']?.[0] ||
			payload.eventId ||
			payload._id ||
			null
		);
	}

	extractHtml(payload: any): string | null {
		return (
			payload.html ||
			payload.HtmlBody ||
			payload.RawHtmlBody ||
			payload.html_body ||
			payload['Html-part'] ||
			payload.items?.[0]?.RawHtmlBody ||
			payload.msys?.relay_message?.content?.html ||
			payload.body?.stripped_html ||
			payload.body?.html ||
			null
		);
	}

	extractText(payload: any): string | null {
		return (
			payload.text ||
			payload.TextBody ||
			payload.RawTextBody ||
			payload.plain_body ||
			payload['Text-part'] ||
			payload.items?.[0]?.RawTextBody ||
			payload.msys?.relay_message?.content?.text ||
			payload.body?.stripped_plaintext ||
			payload.body?.plaintext ||
			null
		);
	}

	extractUnsubscribeUrl(payload: any): string | null {
		if (payload.unsubscribeUrl) {
			return payload.unsubscribeUrl;
		}

		const header = payload.headers?.['List-Unsubscribe']?.[0];
		if (header) {
			const matches = header.match(/<([^>]+)>/g);
			if (matches && matches.length > 0) {
				const urls = matches.map((str: string) => str.replace(/[<>]/g, ''));
				// Prefer HTTPS link over mailto
				const httpLink = urls.find((u: string) => u.startsWith('http'));
				return httpLink || urls[0];
			}
		}

		// Fallback: scan HTML content for "unsubscribe" links
		const html: string =
			payload?.body?.stripped_html ||
			payload?.RawHtmlBody ||
			payload?.html_body ||
			payload?.['Html-part'] ||
			payload?.html ||
			'';

		if (!html) {
			return null;
		}

		const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
		let match;
		while ((match = regex.exec(html)) !== null) {
			const href = match[2];
			const text = (match[3] || '').toLowerCase();
			if (
				text.includes('unsubscribe') ||
				(href && href.toLowerCase().includes('unsubscribe'))
			) {
				return href || null;
			}
		}

		return null;
	}

	extractAuthor(payload: any): string {
		if (payload.from) {
			return payload.from;
		}

		if (payload.FromName) {
			return payload.FromName;
		}

		if (payload.FromFull?.Name) {
			return payload.FromFull.Name;
		}

		if (payload.FromFull?.Email) {
			return payload.FromFull.Email;
		}

		if (payload.Sender) {
			return payload.Sender;
		}

		if (payload.msg_from) {
			return payload.msg_from;
		}

		const brevoFrom = payload.items?.[0]?.From;
		if (brevoFrom) {
			return brevoFrom.Name || brevoFrom.Address || 'Unknown sender';
		}

		if (payload.msys?.relay_message?.friendly_from) {
			return payload.msys.relay_message.friendly_from;
		}
		if (payload.msys?.relay_message?.msg_from) {
			return payload.msys.relay_message.msg_from;
		}

		const fromHeader = payload.headers?.From?.[0]?.trim() || payload.From?.trim();
		const envelopeSender = payload.envelope_sender?.trim();

		if (fromHeader) {
			// Remove any surrounding quotes and whitespace
			return fromHeader.replace(/\s{2,}/g, ' ').replace(/^"|"$/g, '');
		}

		// Fallback to envelope sender if From header is missing or empty
		if (envelopeSender) {
			return envelopeSender;
		}

		return 'Unknown sender';
	}

	async get(userId: string, query: Prisma.newsletterFindFirstArgs) {
		return this.prisma.newsletter.findFirst({
			...query,
			where: {
				...query.where,
				saved_item: {
					userId,
				},
			},
		});
	}

	async create(
		savedItemId: string,
		inboundEmailAddressId: string | null | undefined,
		data: Omit<
			Prisma.newsletterCreateInput,
			| 'savedItemId'
			| 'saved_item'
			| 'inboundEmailAddressId'
			| 'inbound_email_address'
			| 'newsletter_subscription'
		>,
		tx?: Prisma.TransactionClient,
	) {
		const run = async (client: Prisma.TransactionClient) => {
			const owner = await client.saved_item.findUnique({
				where: { id: savedItemId },
				select: { userId: true },
			});

			if (!owner) {
				throw new AppException('Saved item not found', HttpStatus.NOT_FOUND);
			}

			return client.newsletter.create({
				data: {
					...data,
					savedItemId,
					inboundEmailAddressId: inboundEmailAddressId ?? null,
				},
			});
		};

		if (tx) {
			return run(tx);
		}

		return this.prisma.$transaction((client) => run(client));
	}

	extractDate(payload: any) {
		let dateHeader =
			payload.headers?.Date?.[0] ||
			payload.Date ||
			payload.SentAtDate ||
			payload.items?.[0]?.SentAtDate ||
			payload.date ||
			null;

		if (!dateHeader && payload.timestamp) {
			// when timestamp is in seconds with decimals
			dateHeader = dayjs.unix(payload.timestamp).toDate();
		}

		if (!dateHeader && payload.msys?.relay_message?.content?.headers) {
			const header = payload.msys.relay_message.content.headers.find((h: any) => h.Date);
			if (header) {
				dateHeader = header.Date;
			}
		}

		if (dateHeader) {
			return dayjs(dateHeader).format('MMMM D, YYYY [at] h:mm A');
		}

		return dayjs().format('MMMM D, YYYY [at] h:mm A');
	}

	extractReferences(payload: any) {
		let references =
			payload.headers?.References?.[0] ||
			payload.references ||
			payload.InReplyTo ||
			payload.items?.[0]?.InReplyTo ||
			payload.in_reply_to ||
			'';

		if (!references && payload.msys?.relay_message?.content?.headers) {
			const header = payload.msys.relay_message.content.headers.find(
				(h: any) => h.References || h['In-Reply-To'],
			);
			if (header) {
				references = header.References || header['In-Reply-To'];
			}
		}

		return references;
	}

	extractToHeader(payload: any) {
		let toHeader = payload.headers?.To?.[0] || payload.To || payload.to || '';

		const brevoTo = payload.items?.[0]?.To?.[0];
		if (!toHeader && brevoTo) {
			toHeader = brevoTo.Name ? `${brevoTo.Name} <${brevoTo.Address}>` : brevoTo.Address;
		}

		const sparkPostTo = payload.msys?.relay_message?.content?.to?.[0];
		if (!toHeader && sparkPostTo) {
			toHeader = sparkPostTo;
		}

		return toHeader;
	}

	isPossiblyUnreadable(html: string) {
		return this.contentExtractionService.isProbablyReaderable(html);
	}

	parse(input: ProcessNewsletterInput) {
		const result = this.contentExtractionService.extractReadableContent(input.html, {
			maxWords: MAX_NEWSLETTER_WORD_COUNT,
			minWords: MIN_NEWSLETTER_WORD_COUNT,
		});

		const contentHtml = result?.contentHtml || input.html || null;
		const contentText = result?.contentText ?? input.text ?? '';

		return {
			...result,
			contentText,
			wordCount: contentText?.split(/\s+/)?.length || 0,
			contentHtml,
		};
	}
}
