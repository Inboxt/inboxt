import { Resolver, Query, ResolveField, Parent, Args, Mutation } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';

import { EmptyTrash } from './dto/empty-trash.model';
import { GetSavedItemInput } from './dto/get-saved-item.input';
import { PermanentlyDeleteSavedItemsInput } from './dto/permanently-delete-saved-items.input';
import { SetSavedItemLabelsInput } from './dto/set-saved-item-labels.input';
import { UpdateReadingProgressInput } from './dto/update-reading-progress.input';
import { UpdateSavedItemMetadataInput } from './dto/update-saved-item-metadata.input';
import { UpdateSavedItemsReadStatusInput } from './dto/update-saved-items-read-status.input';
import { UpdateSavedItemsStatusInput } from './dto/update-saved-items-status.input';
import { Article } from './entities/article/article.model';
import { ArticleService } from './entities/article/article.service';
import { Label } from './entities/label/label.model';
import { Newsletter } from './entities/newsletter/newsletter.model';
import { NewsletterService } from './entities/newsletter/newsletter.service';
import { SavedItem } from './saved-item.model';
import { SavedItemService } from './saved-item.service';

@Resolver(() => SavedItem)
export class SavedItemResolver {
	constructor(
		private readonly savedItemService: SavedItemService,
		private readonly articleService: ArticleService,
		private readonly newsletterService: NewsletterService,
	) {}

	@ApiTokenAllowed()
	@Query(() => SavedItem, { nullable: true })
	async savedItem(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('query') getSavedItemInput: GetSavedItemInput,
	) {
		return this.savedItemService.get(activeUser.id, {
			where: { id: getSavedItemInput.id },
		});
	}

	@ApiTokenAllowed()
	@Mutation(() => [SavedItem])
	async updateSavedItemsStatus(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateSavedItemsStatusInput,
	) {
		const { ids, ...input } = data;
		const results: SavedItem[] = [];

		for (const id of ids) {
			results.push(
				(await this.savedItemService.updateStatus(
					activeUser.id,
					id,
					input.status,
				)) as SavedItem,
			);
		}

		return results;
	}

	@ApiTokenAllowed()
	@Mutation(() => [SavedItem])
	async updateSavedItemsReadStatus(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateSavedItemsReadStatusInput,
	) {
		return (await this.savedItemService.updateManyReadStatus(
			activeUser.id,
			data.ids,
			data.isRead,
		)) as SavedItem[];
	}

	@ApiTokenAllowed()
	@Mutation(() => SavedItem)
	async updateReadingProgress(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateReadingProgressInput,
	) {
		return this.savedItemService.updateReadingProgress(activeUser.id, data.id, data.progress);
	}

	@ApiTokenAllowed()
	@Mutation(() => [SavedItem])
	async setSavedItemLabels(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: SetSavedItemLabelsInput,
	) {
		const { id, ids, labelIds, addLabelIds, removeLabelIds } = data;
		const allIds = ids ?? (id ? [id] : []);

		if (allIds.length === 0) {
			return [];
		}

		return (await this.savedItemService.setManyLabels(activeUser.id, allIds, {
			set: labelIds,
			add: addLabelIds,
			remove: removeLabelIds,
		})) as SavedItem[];
	}

	@ApiTokenAllowed()
	@Mutation(() => SavedItem)
	async updateSavedItemMetadata(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateSavedItemMetadataInput,
	) {
		const { id, ...input } = data;
		return this.savedItemService.updateMetadata(activeUser.id, id, input);
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

	@Mutation(() => EmptyTrash)
	async emptyTrash(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		const count = await this.savedItemService.emptyTrash(activeUser.id);
		return { success: true, count };
	}

	@ResolveField('article', () => Article, { nullable: true })
	async article(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() savedItem: SavedItem,
	) {
		if (!savedItem?.id) {
			return null;
		}

		return this.articleService.get(activeUser.id, { where: { savedItemId: savedItem.id } });
	}

	@ResolveField('newsletter', () => Newsletter, { nullable: true })
	async newsletter(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() savedItem: SavedItem,
	) {
		if (!savedItem?.id) {
			return null;
		}

		return this.newsletterService.get(activeUser.id, {
			where: { savedItemId: savedItem.id },
		});
	}

	@ResolveField('labels', () => [Label], { nullable: true })
	async labels(@ActiveUserMeta() activeUser: ActiveUserMetaType, @Parent() savedItem: SavedItem) {
		if (!savedItem?.id) {
			return null;
		}

		return this.savedItemService.getLabels(activeUser.id, savedItem.id);
	}
}
