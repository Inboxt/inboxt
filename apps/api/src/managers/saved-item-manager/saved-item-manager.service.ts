import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { addItemFromUrlSchema } from '@inboxt/common';
import { APP_PRIMARY_COLOR } from '@inboxt/common';

import { AppException } from '../../utils/app-exception';
import { Prisma } from '../../../prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { LabelService } from '../../modules/saved-item/entities/label/label.service';
import { SavedItemService } from '../../modules/saved-item/saved-item.service';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { ArticleService } from '../../modules/saved-item/entities/article/article.service';
import {
	DEFAULT_PROCESSED_ITEM_CONTENT,
	DEFAULT_PROCESSED_ITEM_TITLE,
	ITEM_PROCESSING_CONTENT,
	ITEM_PROCESSING_TITLE,
} from '../../common/constants/content-extraction.constants';

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
		const { title: prismaTitle, ...data } = prismaData || {};
		const parsed = await this.articleService.parse(url);
		const updatedItem = await this.savedItemService.update(userId, savedItemId, {
			description: parsed.description,
			title: prismaTitle || parsed.title || DEFAULT_PROCESSED_ITEM_TITLE,
			leadImage: parsed.leadImage,
			wordCount: parsed.wordCount,
			author: parsed.author,
			...data,
		});

		await this.articleService.update(updatedItem.id, userId, {
			contentHtml: parsed.contentHtml || DEFAULT_PROCESSED_ITEM_CONTENT,
			contentText: parsed.contentText || DEFAULT_PROCESSED_ITEM_CONTENT,
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
		const placeholderItem = await this.savedItemService.create(userId, {
			originalUrl: url,
			sourceDomain: new URL(url).hostname.replace(/^www\./, ''),
			title: ITEM_PROCESSING_TITLE(url),
			description: ITEM_PROCESSING_CONTENT(domain),
			type: SavedItemType.ARTICLE,
			wordCount: 0,
			...prismaData,
		});

		await this.articleService.create(placeholderItem.id, {
			contentHtml: ITEM_PROCESSING_CONTENT(domain),
			contentText: ITEM_PROCESSING_CONTENT(domain),
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
			color: APP_PRIMARY_COLOR,
		});

		await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/getting-started.html`,
			[defaultLabel.id],
			{
				author: 'Inboxt Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Welcome to Inboxt! This guide introduces the core features, support channels, and ways to contribute or self-host.',
			},
			{ skipQueue: true },
		);

		await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/tips-and-tricks.html`,
			[defaultLabel.id],
			{
				author: 'Inboxt Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Discover handy shortcuts, expert tips, and clever ways to organize and save content in Inboxt. Learn what’s possible (and what’s coming soon) to boost your productivity and reading experience.',
			},
			{ skipQueue: true },
		);
	}

	async addNewsletterFromEmail(payload: any) {
		return this.newsletterProcessingQueue.add('process-newsletter', payload);
	}
}
