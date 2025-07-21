import { HttpStatus, Injectable } from '@nestjs/common';

import { SavedItemService } from './saved-item.service';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { ArticleService } from './entities/article/article.service';
import { addItemFromUrlSchema } from '@inbox-reader/schemas';
import { UserService } from '../user/user.service';
import { AppException } from '../../utils/app-exception';
import { Prisma } from '../../../prisma/client';
import { LabelService } from './entities/label/label.service';

@Injectable()
export class SavedItemManagementService {
	constructor(
		private articleService: ArticleService,
		private savedItemService: SavedItemService,
		private userService: UserService,
		private labelService: LabelService,
	) {}

	async addArticleFromUrl(
		userId: string,
		url: string,
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
			wordCount: parsed?.wordCount || 0,
			author: parsed?.author,
			...data,
		});

		await this.articleService.create(savedItem.id, {
			contentHtml: parsed?.contentHtml || '',
			contentText: parsed?.contentText || '',
		});

		return savedItem;
	}

	async createDefaultItems(userId: string) {
		const defaultLabel = await this.labelService.create(userId, {
			name: 'Getting Started',
			color: '#1c7ed6',
		});

		const gettingStarted = await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/getting-started.html`,
			{
				author: 'Inbox Reader Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Welcome to Inbox Reader! This guide introduces the core features, support channels, and ways to contribute or self-host.',
			},
		);

		const tipsAndTricks = await this.addArticleFromUrl(
			userId,
			`${process.env.WEB_URL}/tips-and-tricks.html`,
			{
				author: 'Inbox Reader Team',
				originalUrl: null,
				sourceDomain: null,
				description:
					'Discover handy shortcuts, expert tips, and clever ways to organize and save content in Inbox Reader. Learn what’s possible (and what’s coming soon) to boost your productivity and reading experience.',
			},
		);

		await Promise.all(
			[gettingStarted, tipsAndTricks].map((defaultItem) =>
				this.savedItemService.setLabels(userId, defaultItem.id, [defaultLabel.id]),
			),
		);
	}
}
