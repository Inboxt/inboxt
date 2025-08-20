import { HttpStatus, Injectable } from '@nestjs/common';

import { addItemFromUrlSchema } from '@inbox-reader/common';
import { AppException } from '../../utils/app-exception';
import { Prisma } from '../../../prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { LabelService } from '../../modules/saved-item/entities/label/label.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SavedItemService } from '../../modules/saved-item/saved-item.service';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { ArticleService } from '../../modules/saved-item/entities/article/article.service';

@Injectable()
export class SavedItemManagerService {
	constructor(
		private userService: UserService,
		private labelService: LabelService,
		private savedItemService: SavedItemService,
		private articleService: ArticleService,
		@InjectQueue('article-processing') private readonly articleProcessingQueue: Queue,
		@InjectQueue('newsletter-processing') private readonly newsletterProcessingQueue: Queue,
	) {}

	async handleArticleProcessing(
		userId: string,
		savedItemId: string,
		url: string,
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
	) {
		const parsed = await this.articleService.parse(url);
		const updatedItem = await this.savedItemService.update(userId, savedItemId, {
			description: parsed.description,
			title: parsed.title || 'Untitled Article',
			leadImage: parsed.leadImage,
			wordCount: parsed.wordCount,
			author: parsed.author,
			...prismaData,
		});

		await this.articleService.update(updatedItem.id, userId, {
			contentHtml: parsed.contentHtml || 'Sorry, we were unable to parse the content.',
			contentText: parsed.contentText || 'Sorry, we were unable to parse the content.',
		});
	}

	async addArticleFromUrl(
		userId: string,
		url: string,
		labelIds?: string[],
		prismaData?: Partial<
			Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
		>,
		options = { skipQueue: false },
	) {
		/*----------  Validation  ----------*/
		await addItemFromUrlSchema.parseAsync({ url });
		const existingUser = await this.userService.get({ where: { id: userId } });
		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		const domain = new URL(url).hostname.replace(/^www\./, '');
		const description = `Your article from ${domain} is being prepared for your reading library. We're removing ads, formatting content, and optimizing for readability. Once processing is complete, you'll be able to read it offline, highlight important sections, and add notes.`;
		const placeholderItem = await this.savedItemService.create(userId, {
			originalUrl: url,
			sourceDomain: new URL(url).hostname.replace(/^www\./, ''),
			title: 'Processing...',
			description,
			type: SavedItemType.ARTICLE,
			wordCount: 0,
			...prismaData,
		});

		await this.articleService.create(placeholderItem.id, {
			contentHtml: description,
			contentText: description,
		});

		if (labelIds?.length) {
			await this.savedItemService.setLabels(userId, placeholderItem.id, labelIds);
		}

		if (options.skipQueue) {
			await this.handleArticleProcessing(userId, placeholderItem.id, url, prismaData);
		} else {
			await this.articleProcessingQueue.add('process-article', {
				userId,
				url,
				prismaData,
				savedItemId: placeholderItem.id,
			});
		}
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
			{ skipQueue: true },
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
			{ skipQueue: true },
		);
	}

	async addNewsletterFromEmail(payload: any) {
		return this.newsletterProcessingQueue.add('process-newsletter', payload);
	}
}
