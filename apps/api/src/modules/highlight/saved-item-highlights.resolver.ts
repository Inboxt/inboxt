import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { SavedItem } from '../saved-item/saved-item.model';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { HighlightService } from './highlight.service';
import { Highlight } from './highlight.model';

@Resolver(() => SavedItem)
export class SavedItemHighlightsResolver {
	constructor(private highlightService: HighlightService) {}

	@ResolveField('highlights', () => [Highlight], { nullable: true })
	async highlights(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() savedItem: SavedItem,
	) {
		if (!savedItem?.id) {
			return null;
		}

		return this.highlightService.getMany(activeUser.id, {
			where: { savedItemId: savedItem.id },
		});
	}
}
