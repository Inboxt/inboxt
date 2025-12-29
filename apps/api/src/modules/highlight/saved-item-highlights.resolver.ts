import { Resolver, ResolveField, Parent } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { SavedItem } from '~modules/saved-item/saved-item.model';

import { Highlight } from './highlight.model';
import { HighlightService } from './highlight.service';

@Resolver(() => SavedItem)
export class SavedItemHighlightsResolver {
	constructor(private readonly highlightService: HighlightService) {}

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
