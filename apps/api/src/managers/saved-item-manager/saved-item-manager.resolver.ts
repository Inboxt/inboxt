import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { Void } from '~common/models/void.model';

import { AddArticleFromHtmlSnapshotInput } from './dto/add-article-from-html-snapshot.input';
import { AddArticleFromUrlInput } from './dto/add-article-from-url.input';
import { SavedItemManagerService } from './saved-item-manager.service';

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
