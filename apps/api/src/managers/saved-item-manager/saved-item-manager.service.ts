import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import {
	addArticleFromHtmlSnapshotSchema,
	addItemFromUrlSchema,
	APP_PRIMARY_COLOR,
} from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import {
	DEFAULT_PROCESSED_ITEM_CONTENT,
	DEFAULT_PROCESSED_ITEM_TITLE,
	ITEM_PROCESSING_BASE_TITLE,
	ITEM_PROCESSING_CONTENT,
	ITEM_PROCESSING_TITLE,
	NEWSLETTER_PROCESSING_CONTENT,
	NEWSLETTER_PROCESSING_TITLE,
} from '~common/constants/content-extraction.constants';
import { getDefaultItems } from '~common/content';
import { SavedItemType } from '~common/enums/saved-item-type.enum';
import { AppException } from '~common/utils/app-exception';
import { InboundEmailAddressService } from '~modules/inbound-email-address/inbound-email-address.service';
import { MailService } from '~modules/mail/mail.service';
import { PrismaService } from '~modules/prisma/prisma.service';
import {
	ArticleService,
	ProcessArticleInput,
} from '~modules/saved-item/entities/article/article.service';
import { LabelService } from '~modules/saved-item/entities/label/label.service';
import { NewsletterSubscriptionService } from '~modules/saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.service';
import {
	NewsletterService,
	ProcessNewsletterInput,
} from '~modules/saved-item/entities/newsletter/newsletter.service';
import { SavedItemService } from '~modules/saved-item/saved-item.service';
import { UserService } from '~modules/user/user.service';

import { AddArticleFromHtmlSnapshotInput } from './dto/add-article-from-html-snapshot.input';

@Injectable()
export class SavedItemManagerService {
	private readonly logger = new Logger(SavedItemManagerService.name);
	constructor(
		private readonly userService: UserService,
		private readonly labelService: LabelService,
		private readonly savedItemService: SavedItemService,
		private readonly articleService: ArticleService,
		private readonly newsletterService: NewsletterService,
		private readonly inboundEmailAddressService: InboundEmailAddressService,
		@InjectQueue('saved-item-processing')
		private readonly savedItemProcessingQueue: Queue,
		private readonly newsletterSubscriptionService: NewsletterSubscriptionService,
		private readonly mailService: MailService,
		private readonly prisma: PrismaService,
	) {}

	async createDefaultItems(userId: string) {
		const defaultLabel = await this.labelService.create(userId, {
			name: 'Getting Started',
			color: APP_PRIMARY_COLOR,
		});

		for (const content of Object.values(getDefaultItems())) {
			await this.processAndCreateArticle(
				userId,
				{
					html: content.html,
				},
				[defaultLabel.id],
				{
					type: SavedItemType.ARTICLE,
					title: content.metadata.title,
					description: content.metadata.description,
					author: content.metadata.author,
					leadImage: content.metadata.leadImage,
					originalUrl: null,
					sourceDomain: null,
				},
				{ skipQueue: true },
			);
		}
	}

	private async createPendingArticle(
		userId: string,
		input: ProcessArticleInput,
		labelIds?: string[],
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
	) {
		let domain: string | null = null;
		if (input.url) {
			domain = new URL(input.url).hostname.replace(/^www\./, '');
		}

		const created = await this.savedItemService.create(
			userId,
			{
				type: SavedItemType.ARTICLE,
				title:
					prismaData?.title ||
					ITEM_PROCESSING_TITLE(prismaData?.originalUrl ?? input.url ?? ''),
				description:
					prismaData?.description ||
					ITEM_PROCESSING_CONTENT(prismaData?.sourceDomain ?? domain ?? ''),
				wordCount: prismaData?.wordCount ?? 0,
				originalUrl: prismaData?.originalUrl ?? input.url ?? null,
				sourceDomain: prismaData?.sourceDomain ?? domain ?? null,
				...prismaData,
			},
			{ skipQuota: true },
		);

		if (labelIds?.length) {
			await this.savedItemService.setLabels(userId, created.id, labelIds);
		}

		return created;
	}

	async createFailedItem(userId: string, savedItemId: string, error: any) {
		this.logger.warn(
			`Processing of item failed after all retries. Creating failed item: ${savedItemId} for user: ${userId}`,
		);

		const existing = await this.savedItemService.get(userId, {
			where: { id: savedItemId },
		});

		if (!existing) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		const code = error?.response?.code;
		let message = error?.response?.message ?? DEFAULT_PROCESSED_ITEM_CONTENT;

		if (code === 'FETCH_FAILED') {
			message =
				'We couldn’t fetch this page to prepare it for reading. The site may be blocking requests or temporarily unavailable. Please try again later, or try saving a different link.';
		} else if (code === 'STORAGE_QUOTA_EXCEEDED') {
			message =
				'You’ve reached your storage limit, so we couldn’t save this item. Delete items you no longer need to free up space.';
		}

		const isArticleProcessing = existing.title.startsWith(ITEM_PROCESSING_BASE_TITLE);
		const isNewsletterProcessing = existing.title.startsWith(NEWSLETTER_PROCESSING_TITLE);

		let existingTitle = existing.title;
		if (isArticleProcessing) {
			const prefix = `${ITEM_PROCESSING_BASE_TITLE} from `;
			let cleaned = existingTitle.startsWith(prefix)
				? existingTitle.slice(prefix.length)
				: existingTitle;

			if (cleaned.endsWith('...')) {
				cleaned = cleaned.slice(0, -3).trim();
			}

			existingTitle = cleaned.trim() || DEFAULT_PROCESSED_ITEM_TITLE;
		} else if (isNewsletterProcessing) {
			existingTitle = DEFAULT_PROCESSED_ITEM_TITLE;
		}

		const title = `Failed to process: ${existingTitle}`;
		await this.savedItemService.update(
			userId,
			savedItemId,
			{
				title,
				description: message,
			},
			undefined,
			{ skipQuota: true },
		);

		if (existing.type === SavedItemType.ARTICLE) {
			await this.articleService.create(
				savedItemId,
				{
					contentHtml: message,
					contentText: message,
				},
				undefined,
				{ skipQuota: true },
			);
		} else {
			await this.newsletterService.create(
				savedItemId,
				null,
				{
					contentHtml: message,
					contentText: message,
				},
				undefined,
				{ skipQuota: true },
			);
		}
	}

	async processArticle(
		userId: string,
		savedItemId: string,
		input: ProcessArticleInput,
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
	) {
		const parsed = await this.articleService.parse(input);
		await this.prisma.$transaction(async (client) => {
			await this.articleService.create(
				savedItemId,
				{
					contentHtml: parsed.contentHtml || DEFAULT_PROCESSED_ITEM_CONTENT,
					contentText: parsed.contentText || DEFAULT_PROCESSED_ITEM_CONTENT,
				},
				client,
			);

			await this.savedItemService.update(
				userId,
				savedItemId,
				{
					title: prismaData?.title ?? parsed?.title ?? DEFAULT_PROCESSED_ITEM_TITLE,
					wordCount: prismaData?.wordCount ?? parsed.wordCount ?? 0,
					author: prismaData?.author ?? parsed?.author ?? null,
					description:
						prismaData?.description ??
						parsed?.description ??
						DEFAULT_PROCESSED_ITEM_CONTENT,
					leadImage: prismaData?.leadImage ?? parsed?.leadImage ?? null,
				},
				client,
			);
		});
	}

	async processAndCreateArticle(
		userId: string,
		input: ProcessArticleInput,
		labelIds?: string[],
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
		opts?: { skipQueue?: boolean },
	) {
		if (!input.html && !input.url) {
			throw new AppException('Invalid input', HttpStatus.BAD_REQUEST);
		}

		const created = await this.createPendingArticle(userId, input, labelIds, prismaData);
		if (opts?.skipQueue) {
			return this.processArticle(userId, created.id, input, prismaData);
		}

		await this.savedItemProcessingQueue.add(
			'process-article',
			{
				userId,
				savedItemId: created.id,
				input,
				prismaData,
			},
			{
				removeOnComplete: true,
				removeOnFail: true,
			},
		);

		return created.id;
	}

	async addArticleFromUrl(
		userId: string,
		url: string,
		labelIds?: string[],
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
	) {
		await addItemFromUrlSchema.parseAsync({ url });
		const existingUser = await this.userService.get({ where: { id: userId } });
		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		await this.processAndCreateArticle(userId, { url }, labelIds, prismaData);
	}

	private createPendingNewsletter(
		userId: string,
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'newsletter' | 'id'>
		>,
	) {
		return this.savedItemService.create(
			userId,
			{
				type: SavedItemType.NEWSLETTER,
				title: prismaData?.title ?? NEWSLETTER_PROCESSING_TITLE,
				wordCount: prismaData?.wordCount || 0,
				description: prismaData?.description ?? NEWSLETTER_PROCESSING_CONTENT,
				...prismaData,
			},
			{ skipQuota: true },
		);
	}

	async processNewsletter(
		ids: {
			userId: string;
			savedItemId: string;
			inboundEmailAddressId?: string | null;
			messageId?: string | null;
		},
		input: ProcessNewsletterInput,
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'newsletter' | 'id'>
		>,
		unsubscribeUrl?: string | null,
	) {
		const parsed = this.newsletterService.parse(input);
		await this.prisma.$transaction(async (client) => {
			await this.newsletterService.create(
				ids.savedItemId,
				ids.inboundEmailAddressId,
				{
					contentHtml: parsed?.contentHtml || DEFAULT_PROCESSED_ITEM_CONTENT,
					contentText: parsed?.contentText || DEFAULT_PROCESSED_ITEM_CONTENT,
					messageId: ids.messageId,
				},
				client,
			);

			await this.savedItemService.update(
				ids.userId,
				ids.savedItemId,
				{
					title: prismaData?.title ?? parsed?.title ?? DEFAULT_PROCESSED_ITEM_TITLE,
					wordCount: prismaData?.wordCount ?? parsed.wordCount ?? 0,
					author: prismaData?.author ?? parsed?.author ?? null,
					description:
						prismaData?.description ??
						parsed?.description ??
						DEFAULT_PROCESSED_ITEM_CONTENT,
				},
				client,
			);
		});

		if (!!unsubscribeUrl && parsed?.author && !!ids.inboundEmailAddressId && ids.userId) {
			let subscription = await this.newsletterSubscriptionService.get(ids.userId, {
				where: {
					name: parsed.author,
					inboundEmailAddressId: ids.inboundEmailAddressId,
				},
			});

			if (subscription) {
				subscription = await this.newsletterSubscriptionService.update(
					ids.userId,
					subscription.id,
					{
						lastReceivedAt: new Date(),
						unsubscribeAttemptedAt: null,
						status: 'ACTIVE',
						unsubscribeUrl,
					},
				);
			} else {
				subscription = await this.newsletterSubscriptionService.create(
					ids.userId,
					ids.inboundEmailAddressId,
					{
						name: parsed.author,
						lastReceivedAt: new Date(),
						unsubscribeUrl,
					},
				);
			}

			await this.newsletterSubscriptionService.link(
				ids.userId,
				subscription.id,
				ids.savedItemId,
			);
		}
	}

	async processAndCreateNewsletter(
		userId: string,
		inboundEmailAddressId: string | null,
		messageId: string | null,
		input: ProcessNewsletterInput,
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'newsletter' | 'id'>
		>,
		unsubscribeUrl?: string | null,
	) {
		if (!input.html && !input.text) {
			throw new AppException(
				'No HTML or text content found in input, skipping newsletter creation.',
				HttpStatus.BAD_REQUEST,
			);
		}

		const created = await this.createPendingNewsletter(userId, prismaData);
		await this.savedItemProcessingQueue.add(
			'process-newsletter',
			{
				ids: {
					userId,
					inboundEmailAddressId,
					messageId,
					savedItemId: created.id,
				},
				input,
				prismaData,
				unsubscribeUrl,
			},
			{
				removeOnComplete: true,
				removeOnFail: true,
				attempts: 2,
				backoff: { type: 'fixed', delay: 30000 },
			},
		);
	}

	async addNewsletterFromEmail(payload: any) {
		const messageId = payload?._id;
		this.logger.log(
			`Starting to parse incoming newsletter email with messageId: ${messageId || 'unknown'}`,
		);

		// Finding the recipient email address
		const toAddresses: string[] = payload.recipients?.length
			? payload.recipients
			: (payload.headers?.To ?? []);

		if (!toAddresses.length || !toAddresses[0]) {
			this.logger.warn('No recipient addresses found in payload.');
			return;
		}

		const inboundEmailAddress = await this.inboundEmailAddressService.verify(toAddresses[0]);
		if (!inboundEmailAddress || !inboundEmailAddress?.userId) {
			this.logger.warn(`Recipient ${toAddresses[0]} is not a valid or active inbox address.`);
			return;
		}

		// Using validation_url endpoint to make sure that this is a valid Maileroo parsed email
		if (!payload.validation_url) {
			this.logger.warn('Missing validation_url. Skipping email.');
			return;
		}

		const response = await fetch(payload.validation_url as string);
		const validationResponse: any = await response.json();
		if (!validationResponse.success) {
			this.logger.warn(`Validation failed: ${validationResponse?.message} || No message`);
			return;
		}

		// Use message id from Maileroo to check for duplicates
		const isDuplicate = await this.newsletterService.get(inboundEmailAddress.userId, {
			where: {
				messageId,
			},
		});

		if (isDuplicate) {
			this.logger.log(`Duplicate message ID: ${messageId}. Skipping.`);
			return;
		}

		const strippedHtml = payload?.body?.stripped_html as string;
		const strippedText = payload?.body?.stripped_plaintext as string;

		if (!strippedHtml || !this.newsletterService.isPossiblyUnreadable(strippedHtml)) {
			this.logger.warn(
				'No HTML content found in payload or the newsletter is possibly unreadable.. Trying to forward the email to the user.',
			);

			const user = await this.userService.get({ where: { id: inboundEmailAddress.userId } });
			if (!user) {
				return;
			}

			return this.mailService.forward(user.emailAddress, payload);
		}

		try {
			await this.processAndCreateNewsletter(
				inboundEmailAddress.userId,
				inboundEmailAddress.id,
				messageId as string,
				{ html: strippedHtml, text: strippedText },
				{
					title: payload.headers?.Subject?.[0],
					author: this.newsletterService.extractAuthor(payload),
				},
				this.newsletterService.extractUnsubscribeUrl(payload),
			);
		} catch (error) {
			this.logger.error(`Error processing incoming newsletter: ${error}`);
			return;
		}

		if (payload?.deletion_url) {
			try {
				await fetch(payload.deletion_url as string);
			} catch {
				// Ignore fetch errors
			}
		}
	}

	async addArticleFromHtmlSnapshot(userId: string, input: AddArticleFromHtmlSnapshotInput) {
		await addArticleFromHtmlSnapshotSchema.parseAsync(input);
		const existingUser = await this.userService.get({ where: { id: userId } });
		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		return await this.processAndCreateArticle(userId, {
			url: input.url,
			html: input.html,
		});
	}
}
