import { HttpStatus, Injectable } from '@nestjs/common';

import { SavedItemService } from './saved-item.service';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { ArticleService } from './entities/article/article.service';
import { addItemFromUrlSchema } from '@inbox-reader/schemas';
import { UserService } from '../user/user.service';
import { AppException } from '../../utils/app-exception';

@Injectable()
export class SavedItemManagementService {
	constructor(
		private articleService: ArticleService,
		private savedItemService: SavedItemService,
		private userService: UserService,
	) {}

	async addArticleFromUrl(userId: string, url: string) {
		/*----------  Validation  ----------*/
		await addItemFromUrlSchema.parseAsync({ url });
		const existingUser = await this.userService.get({ where: { id: userId } });
		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		// todo: add blocked urls?

		/*----------  Processing  ----------*/
		const parsed = await this.articleService.parse(url);
		const savedItem = await this.savedItemService.create({
			userId,
			originalUrl: url,
			sourceDomain: new URL(url).hostname.replace(/^www\\./, ''),
			description: parsed?.description,
			title: parsed?.title || '',
			leadImage: parsed?.leadImage,
			type: SavedItemType.ARTICLE,
			wordCount: parsed?.wordCount || 0,
			author: parsed?.author,
		});

		await this.articleService.create(savedItem.id, {
			contentHtml: parsed?.contentHtml || '',
			contentText: parsed?.contentText || '',
		});

		return savedItem;
	}
}
