import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { Logger } from '@nestjs/common';

import { Prisma } from '../../../../../prisma/client';
import { PrismaService } from '../../../../services/prisma.service';
import { InboundEmailAddressService } from '../../../inbound-email-address/inbound-email-address.service';
import { MAX_NEWSLETTER_WORD_COUNT, MIN_NEWSLETTER_WORD_COUNT } from '@inboxt/common';
import { ContentExtractionService } from '../../../../services/content-extraction.service';

@Injectable()
export class NewsletterService {
	private readonly logger = new Logger(NewsletterService.name);
	constructor(
		private prisma: PrismaService,
		private inboundEmailAddressService: InboundEmailAddressService,
		private contentExtractionService: ContentExtractionService,
	) {}

	private extractUnsubscribeUrl(payload: any): string | null {
		const header = payload.headers?.['List-Unsubscribe']?.[0];
		if (header) {
			const matches = header.match(/<([^>]+)>/g);
			if (matches && matches.length > 0) {
				const urls = matches.map((str) => str.replace(/[<>]/g, ''));
				// Prefer HTTPS link over mailto
				const httpLink = urls.find((u) => u.startsWith('http'));
				return httpLink || urls[0];
			}
		}

		// Fallback: scan HTML content for "unsubscribe" links
		const html = payload?.body?.stripped_html || '';
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

	private extractAuthor(payload: any): string {
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
	) {
		return this.prisma.newsletter.create({
			data: {
				...data,
				savedItemId,
				inboundEmailAddressId,
			},
		});
	}

	async parse(payload: any) {
		const messageId = payload?._id;
		this.logger.log(
			`Starting to parse incoming newsletter email with messageId: ${messageId || 'unknown'}`,
		);

		// Finding the recipient email address
		const toAddresses: string[] = payload.recipients?.length
			? payload.recipients
			: (payload.headers?.To ?? []);

		if (!toAddresses.length) {
			this.logger.warn('No recipient addresses found in payload.');
			return {
				success: false,
			};
		}

		// Check if the recipient email address comes from our app and the email address is still in use (not soft-deleted)
		const inboundEmailAddress = await this.inboundEmailAddressService.verify(toAddresses[0]);
		if (!inboundEmailAddress || !inboundEmailAddress?.userId) {
			this.logger.warn(`Recipient ${toAddresses[0]} is not a valid or active inbox address.`);
			return {
				success: false,
			};
		}

		// Using validation_url endpoint to make sure that this is a valid Maileroo parsed email
		if (!payload.validation_url) {
			this.logger.warn('Missing validation_url. Skipping email.');
			return {
				success: false,
			};
		}

		const response = await fetch(payload.validation_url);
		const validationResponse: any = await response.json();
		if (!validationResponse.success) {
			this.logger.warn(`Validation failed: ${validationResponse?.message} || No message`);
			return {
				success: false,
			};
		}

		// Use message id from Maileroo to check for duplicates
		const isDuplicate = await this.get(inboundEmailAddress.userId, {
			where: {
				messageId,
			},
		});

		if (isDuplicate) {
			this.logger.log(`Duplicate message ID: ${messageId}. Skipping.`);
			return {
				success: false,
			};
		}

		// Content parsing and sanitizing
		const strippedHtml = payload?.body?.stripped_html;
		const strippedText = payload?.body?.stripped_plaintext;

		if (!strippedHtml) {
			this.logger.warn('No HTML content found in payload.');
			return {
				success: false,
				shouldForward: true,
				userId: inboundEmailAddress.userId,
			};
		}

		let contentHtml: string | null = strippedHtml as string;
		let description: string | null = null;
		let withReadability = true;

		try {
			const readerRes = this.contentExtractionService.extractReadableContent(
				strippedHtml as string,
				{
					maxWords: MAX_NEWSLETTER_WORD_COUNT,
					minWords: MIN_NEWSLETTER_WORD_COUNT,
				},
			);

			contentHtml = readerRes?.contentHtml || null;
			description = readerRes?.description || null;
			withReadability = readerRes.withReadability;
		} catch (error) {
			this.logger.warn(`Error parsing newsletter: ${error}`);
			return {
				success: false,
				shouldForward: true,
				userId: inboundEmailAddress.userId,
			};
		}

		if (!withReadability) {
			this.logger.warn(
				'Readability failed to parse email. Using stripped and sanitized HTML as fallback.',
			);
		}

		// Fallback description handler
		if (!description && strippedText) {
			const fallbackLines = strippedText
				.split('\n')
				.map((line) => line.trim())
				.filter(
					(line) =>
						Boolean(line) &&
						!line.toLowerCase().startsWith('[image:') &&
						!line.toLowerCase().startsWith('unsubscribe') &&
						!line.toLowerCase().startsWith('click here') &&
						!/^https?:\/\//.test(line),
				);

			this.logger.log('Generating fallback description from plain text.');
			description = fallbackLines.slice(0, 2).join(' ') || null;
		}

		this.logger.log(
			`Finished parsing newsletter: ${payload.headers?.Subject?.[0] || '[No Subject]'}`,
		);

		return {
			success: true,
			userId: inboundEmailAddress.userId,
			data: {
				messageId,
				inboundEmailAddressId: inboundEmailAddress.id,
				title: payload.headers?.Subject?.[0] || '',
				contentHtml: contentHtml,
				contentText: strippedText,
				description,
				wordCount: strippedText?.split(/\s+/)?.length || 0,
				author: this.extractAuthor(payload),
				unsubscribeUrl: this.extractUnsubscribeUrl(payload),
			},
		};
	}
}
