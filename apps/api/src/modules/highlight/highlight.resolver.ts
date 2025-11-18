import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { Highlight } from './highlight.model';
import { HighlightService } from './highlight.service';
import { CreateHighlightInput } from './dto/create-highlight.input';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { HighlightSegment } from './highlight-segment.model';
import { DeleteHighlightsInput } from './dto/delete-highlights.input';
import { SavedItemService } from '../saved-item/saved-item.service';
import { SavedItem } from '../saved-item/saved-item.model';
import { ApiTokenAllowed } from '../../decorators/api-token.decorator';

@Resolver(() => Highlight)
export class HighlightResolver {
	constructor(
		private highlightService: HighlightService,
		private savedItemService: SavedItemService,
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
	async segments(@ActiveUserMeta() activeUser: ActiveUserMetaType, @Parent() highlight) {
		if (!highlight?.id) {
			return null;
		}

		return this.highlightService.getSegments(activeUser.id, highlight.id);
	}

	@ResolveField('savedItem', () => SavedItem, { nullable: true })
	async savedItem(@ActiveUserMeta() activeUser: ActiveUserMetaType, @Parent() highlight) {
		if (!highlight?.savedItemId) {
			return null;
		}

		return this.savedItemService.get(activeUser.id, {
			where: { id: highlight.savedItemId },
		});
	}
}
