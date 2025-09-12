import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { Highlight } from './highlight.model';
import { HighlightService } from './highlight.service';
import { CreateHighlightInput } from './dto/create-highlight.input';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { HighlightSegment } from './highlight-segment.model';
import { DeleteHighlightInput } from './dto/delete-highlight.input';

@Resolver(() => Highlight)
export class HighlightResolver {
	constructor(private highlightService: HighlightService) {}

	@Mutation(() => Highlight)
	async createHighlight(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: CreateHighlightInput,
	) {
		return this.highlightService.create(data, activeUser.id);
	}

	@Mutation(() => Void)
	async deleteHighlight(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteHighlightInput,
	) {
		await this.highlightService.delete(data, activeUser.id);
		return VOID_RESPONSE;
	}

	@ResolveField('segments', () => [HighlightSegment], { nullable: true })
	async segments(@Parent() highlight) {
		if (!highlight?.id) {
			return null;
		}

		return this.highlightService.getSegments(highlight.id);
	}
}
