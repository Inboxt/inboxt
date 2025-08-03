import { HttpStatus, Injectable } from '@nestjs/common';

import { SavedItemType } from '../../enums/saved-item-type.enum';
import { addItemFromUrlSchema } from '@inbox-reader/schemas';
import { AppException } from '../../utils/app-exception';
import { Prisma } from '../../../prisma/client';
import { ArticleService } from 'src/modules/saved-item/entities/article/article.service';
import { SavedItemService } from '../../modules/saved-item/saved-item.service';
import { UserService } from 'src/modules/user/user.service';
import { LabelService } from '../../modules/saved-item/entities/label/label.service';
import { NewsletterService } from '../../modules/saved-item/entities/newsletter/newsletter.service';
import { NewsletterSubscriptionService } from '../../modules/saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.service';
import { MailService } from '../../modules/mail/mail.service';

@Injectable()
export class SavedItemManagerService {
	constructor(
		private articleService: ArticleService,
		private savedItemService: SavedItemService,
		private userService: UserService,
		private labelService: LabelService,
		private newsletterService: NewsletterService,
		private newsletterSubscriptionService: NewsletterSubscriptionService,
		private mailService: MailService,
	) {}

	async addArticleFromUrl(
		userId: string,
		url: string,
		labelIds?: string[],
		data?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
	) {
		/*----------  Validation  ----------*/
		await addItemFromUrlSchema.parseAsync({ url });
		const existingUser = await this.userService.get({ where: { id: userId } });
		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		const parsed = await this.articleService.parse(url);
		const savedItem = await this.savedItemService.create(userId, {
			originalUrl: url,
			sourceDomain: new URL(url).hostname.replace(/^www\\./, ''),
			description: parsed?.description,
			title: parsed?.title || '',
			leadImage: parsed?.leadImage,
			type: SavedItemType.ARTICLE,
			wordCount: parsed?.wordCount,
			author: parsed?.author,
			...data,
		});

		if (labelIds && labelIds?.length) {
			await this.savedItemService.setLabels(userId, savedItem.id, labelIds);
		}

		await this.articleService.create(savedItem.id, {
			contentHtml: parsed?.contentHtml || 'Sorry, we were unable to parse the content.',
			contentText: parsed?.contentText || 'Sorry, we were unable to parse the content.',
		});
	}

	async createDefaultItems(userId: string) {
		const defaultLabel = await this.labelService.create(userId, {
			name: 'Getting Started',
			color: '#1c7ed6',
		});

		await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/getting-started.html`,
			[defaultLabel.id],
			{
				author: 'Inbox Reader Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Welcome to Inbox Reader! This guide introduces the core features, support channels, and ways to contribute or self-host.',
			},
		);

		await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/tips-and-tricks.html`,
			[defaultLabel.id],
			{
				author: 'Inbox Reader Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Discover handy shortcuts, expert tips, and clever ways to organize and save content in Inbox Reader. Learn what’s possible (and what’s coming soon) to boost your productivity and reading experience.',
			},
		);
	}

	async addNewsletterFromEmail(payload: any) {
		const { success, shouldForward, data, userId } =
			await this.newsletterService.parse(payload);

		if (!success && !shouldForward) {
			return;
		}

		if (!success && shouldForward) {
			const user = await this.userService.get({ where: { id: userId } });
			if (!user) {
				return;
			}

			await this.mailService.forward(user.emailAddress, payload);
			return;
		}

		if (!data || !userId) {
			return;
		}

		const savedItem = await this.savedItemService.create(userId, {
			title: data?.title || '',
			type: SavedItemType.NEWSLETTER,
			wordCount: data.wordCount,
			author: data?.author,
			description: data?.description,
		});

		await this.newsletterService.create(savedItem.id, data.inboundEmailAddressId, {
			contentHtml: data?.contentHtml || 'Sorry, we were unable to parse the content.',
			contentText: data?.contentText || 'Sorry, we were unable to parse the content.',
			messageId: data.messageId,
		});

		if (data?.unsubscribeUrl && data?.author && data?.inboundEmailAddressId && userId) {
			let subscription = await this.newsletterSubscriptionService.get(userId, {
				where: { name: data.author, inboundEmailAddressId: data.inboundEmailAddressId },
			});

			if (subscription) {
				subscription = await this.newsletterSubscriptionService.update(
					userId,
					subscription.id,
					{
						lastReceivedAt: new Date(),
						unsubscribeAttemptedAt: null,
						status: 'ACTIVE',
						unsubscribeUrl: data?.unsubscribeUrl,
					},
				);
			} else {
				subscription = await this.newsletterSubscriptionService.create(
					userId,
					data.inboundEmailAddressId,
					{
						name: data.author,
						lastReceivedAt: new Date(),
						unsubscribeUrl: data?.unsubscribeUrl,
					},
				);
			}

			await this.newsletterSubscriptionService.link(userId, subscription.id, savedItem.id);
		}

		if (payload?.deletion_url) {
			await fetch(payload.deletion_url);
		}
	}
}
