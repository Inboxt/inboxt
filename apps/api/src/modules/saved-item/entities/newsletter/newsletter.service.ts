import { HttpStatus, Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';

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

		const toAddresses: string[] = payload.recipients?.length
			? payload.recipients
			: (payload.headers?.To ?? []);

		return toAddresses?.[0] ?? null;
	}

	extractSubject(payload: any): string | null {
		if (payload.subject) {
			return payload.subject;
		}
		return payload.headers?.Subject?.[0] ?? null;
	}

	extractEventId(payload: any): string | null {
		return payload.eventId || payload._id || null;
	}

	extractMessageId(payload: any): string | null {
		return payload.messageId || payload.message_id || null;
	}

	extractHtml(payload: any): string | null {
		return payload.html || payload.body?.stripped_html || payload.body?.html || null;
	}

	extractText(payload: any): string | null {
		return payload.text || payload.body?.stripped_plaintext || payload.body?.plaintext || null;
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
		const html: string = payload?.body?.stripped_html || '';
		const dom = new JSDOM(html);
		const doc = dom.window.document;
		const links = Array.from(doc.querySelectorAll('a[href]'));

		for (const link of links) {
			const text = link.textContent?.toLowerCase() || '';
			const href = link.getAttribute('href') || '';
			if (text.includes('unsubscribe') || href.includes('unsubscribe')) {
				return href;
			}
		}

		return null;
	}

	extractAuthor(payload: any): string {
		if (payload.from) {
			return payload.from;
		}

		const fromHeader = payload.headers?.From?.[0]?.trim();
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
