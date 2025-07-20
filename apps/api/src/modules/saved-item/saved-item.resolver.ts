import { Resolver, Query, ResolveField, Parent, Args, Mutation } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { SavedItemService } from './saved-item.service';
import { Article } from './article.model';
import { ArticleService } from './entities/article/article.service';
import { SavedItem } from './saved-item.model';
import { GetSavedItemInput } from './dto/get-saved-item.input';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { UpdateSavedItemStatusInput } from './dto/update-saved-item-status.input';
import { SetSavedItemLabelsInput } from './dto/set-saved-item-labels.input';
import { Label } from './entities/label/label.model';
import { SavedItemConnection } from './saved-items.model';
import { GetSavedItemsInput } from './dto/get-saved-items.input';
import { PermanentlyDeleteSavedItemsInput } from './dto/permanently-delete-saved-items.input';

@Resolver(() => SavedItem)
export class SavedItemResolver {
	constructor(
		private savedItemService: SavedItemService,
		private articleService: ArticleService,
	) {}

	@Query(() => SavedItemConnection)
	async savedItems(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') data: GetSavedItemsInput,
	) {
		return this.savedItemService.getPaginated(user.userId, data);
	}

	@Query(() => SavedItem)
	async savedItem(@Args('query') getSavedItemInput: GetSavedItemInput) {
		return this.savedItemService.get({
			where: { id: getSavedItemInput.id },
		});
	}

	@Mutation(() => Void)
	async updateSavedItemStatus(@Args('data') data: UpdateSavedItemStatusInput) {
		const { ids, ...input } = data;
		for (const id of ids) {
			await this.savedItemService.updateStatus(id, input.status);
		}

		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async setSavedItemLabels(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') data: SetSavedItemLabelsInput,
	) {
		await this.savedItemService.setLabels(data.id, user.userId, data.labelIds);
		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async permanentlyDeleteSavedItems(@Args('data') data: PermanentlyDeleteSavedItemsInput) {
		if (data.ids.length === 0) {
			return VOID_RESPONSE;
		}

		for (const id of data.ids) {
			await this.savedItemService.delete(id);
		}

		return VOID_RESPONSE;
	}

	@ResolveField('article', () => Article, { nullable: true })
	async article(@Parent() savedItem, @ActiveUserMeta() user: ActiveUserMetaType) {
		if (!savedItem) {
			return null;
		}

		return this.articleService.get({ where: { savedItemId: savedItem.id } });
	}

	@ResolveField('labels', () => [Label], { nullable: true })
	async labels(@Parent() savedItem) {
		if (!savedItem) {
			return null;
		}

		return this.savedItemService.getLabels(savedItem.id);
	}
}
