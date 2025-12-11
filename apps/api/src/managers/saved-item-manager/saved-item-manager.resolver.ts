import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { RateLimit } from '../../decorators/rate-limit.decorator';
import { ApiTokenAllowed } from '../../decorators/api-token.decorator';
import { Void } from '../../models/void.model';
import { SavedItemManagerService } from './saved-item-manager.service';
import { AddArticleFromUrlInput } from './dto/add-article-from-url.input';
import { VOID_RESPONSE } from '../../constants/void';
import { AddArticleFromHtmlSnapshotInput } from './dto/add-article-from-html-snapshot.input';
import { VerifiedOnly } from '../../decorators/account.decorator';

@Resolver()
export class SavedItemManagerResolver {
	constructor(private readonly savedItemManagerService: SavedItemManagerService) {}

	@Mutation(() => Void)
	@ApiTokenAllowed()
	@RateLimit({
		user: { points: 150, duration: 60 * 60 },
		api_token: { points: 300, duration: 60 * 60 },
	})
	async addArticleFromUrl(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: AddArticleFromUrlInput,
	) {
		await this.savedItemManagerService.addArticleFromUrl(
			activeUser.id,
			data.url,
			data.labelIds || [],
		);

		return VOID_RESPONSE;
	}

	@VerifiedOnly()
	@Mutation(() => String)
	@RateLimit({
		user: { points: 150, duration: 60 * 60 },
	})
	async addArticleFromHtmlSnapshot(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: AddArticleFromHtmlSnapshotInput,
	) {
		return await this.savedItemManagerService.addArticleFromHtmlSnapshot(activeUser.id, data);
	}
}
