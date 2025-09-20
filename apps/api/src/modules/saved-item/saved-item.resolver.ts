import { Resolver, Query, ResolveField, Parent, Args, Mutation } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { SavedItemService } from './saved-item.service';
import { Article } from './entities/article/article.model';
import { ArticleService } from './entities/article/article.service';
import { SavedItem } from './saved-item.model';
import { GetSavedItemInput } from './dto/get-saved-item.input';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { UpdateSavedItemStatusInput } from './dto/update-saved-item-status.input';
import { SetSavedItemLabelsInput } from './dto/set-saved-item-labels.input';
import { Label } from './entities/label/label.model';
import { PermanentlyDeleteSavedItemsInput } from './dto/permanently-delete-saved-items.input';
import { Newsletter } from './entities/newsletter/newsletter.model';
import { NewsletterService } from './entities/newsletter/newsletter.service';

@Resolver(() => SavedItem)
export class SavedItemResolver {
	constructor(
		private savedItemService: SavedItemService,
		private articleService: ArticleService,
		private newsletterService: NewsletterService,
	) {}

	@Query(() => SavedItem, { nullable: true })
	async savedItem(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('query') getSavedItemInput: GetSavedItemInput,
	) {
		return this.savedItemService.get(activeUser.id, {
			where: { id: getSavedItemInput.id },
		});
	}

	@Mutation(() => Void)
	async updateSavedItemStatus(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateSavedItemStatusInput,
	) {
		const { ids, ...input } = data;
		for (const id of ids) {
			await this.savedItemService.updateStatus(activeUser.id, id, input.status);
		}

		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async setSavedItemLabels(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: SetSavedItemLabelsInput,
	) {
		await this.savedItemService.setLabels(activeUser.id, data.id, data.labelIds);
		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async permanentlyDeleteSavedItems(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: PermanentlyDeleteSavedItemsInput,
	) {
		if (data.ids.length === 0) {
			return VOID_RESPONSE;
		}

		for (const id of data.ids) {
			await this.savedItemService.delete(activeUser.id, id);
		}

		return VOID_RESPONSE;
	}

	@ResolveField('article', () => Article, { nullable: true })
	async article(@Parent() savedItem, @ActiveUserMeta() activeUser: ActiveUserMetaType) {
		if (!savedItem?.id) {
			return null;
		}

		return this.articleService.get(activeUser.id, { where: { savedItemId: savedItem.id } });
	}

	@ResolveField('newsletter', () => Newsletter, { nullable: true })
	async newsletter(@Parent() savedItem, @ActiveUserMeta() activeUser: ActiveUserMetaType) {
		if (!savedItem?.id) {
			return null;
		}

		return this.newsletterService.get(activeUser.id, {
			where: { savedItemId: savedItem.id },
		});
	}

	@ResolveField('labels', () => [Label], { nullable: true })
	async labels(@ActiveUserMeta() activeUser: ActiveUserMetaType, @Parent() savedItem) {
		if (!savedItem?.id) {
			return null;
		}

		return this.savedItemService.getLabels(activeUser.id, savedItem.id);
	}
}
