import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';
import { SavedItem } from '~modules/saved-item/saved-item.model';
import { SavedItemService } from '~modules/saved-item/saved-item.service';

import { CreateHighlightInput } from './dto/create-highlight.input';
import { DeleteHighlightsInput } from './dto/delete-highlights.input';
import { HighlightSegment } from './highlight-segment.model';
import { Highlight } from './highlight.model';
import { HighlightService } from './highlight.service';

@Resolver(() => Highlight)
export class HighlightResolver {
	constructor(
		private readonly highlightService: HighlightService,
		private readonly savedItemService: SavedItemService,
	) {}

	@ApiTokenAllowed()
	@Mutation(() => Highlight)
	async createHighlight(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: CreateHighlightInput,
	) {
		return this.highlightService.create(activeUser.id, data);
	}

	@Mutation(() => Void)
	async deleteHighlights(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteHighlightsInput,
	) {
		await this.highlightService.delete(activeUser.id, data);
		return VOID_RESPONSE;
	}

	@ResolveField('segments', () => [HighlightSegment], { nullable: true })
	async segments(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() highlight: Highlight,
	) {
		if (!highlight?.id) {
			return null;
		}

		return this.highlightService.getSegments(activeUser.id, highlight.id);
	}

	@ResolveField('savedItem', () => SavedItem, { nullable: true })
	async savedItem(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() highlight: Highlight & { savedItemId?: string },
	) {
		if (!highlight?.savedItemId) {
			return null;
		}

		return this.savedItemService.get(activeUser.id, {
			where: { id: highlight.savedItemId },
		});
	}
}
