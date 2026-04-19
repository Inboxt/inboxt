import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';

import { CreateSavedQueryInput } from './dto/create-saved-query.input';
import { DeleteSavedQueryInput } from './dto/delete-saved-query.input';
import { UpdateSavedQueryInput } from './dto/update-saved-query.input';
import { SavedQuery } from './saved-query.model';
import { SavedQueryService } from './saved-query.service';

@Resolver(() => SavedQuery)
export class SavedQueryResolver {
	constructor(private readonly savedQueryService: SavedQueryService) {}

	@ApiTokenAllowed()
	@Mutation(() => SavedQuery)
	async createSavedQuery(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: CreateSavedQueryInput,
	) {
		return this.savedQueryService.create(activeUser.id, data);
	}

	@ApiTokenAllowed()
	@Mutation(() => SavedQuery)
	async updateSavedQuery(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateSavedQueryInput,
	) {
		const { id, ...input } = data;
		return this.savedQueryService.update(activeUser.id, id, input);
	}

	@Mutation(() => Void)
	async deleteSavedQuery(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteSavedQueryInput,
	) {
		await this.savedQueryService.delete(activeUser.id, data.id);
		return VOID_RESPONSE;
	}

	@ApiTokenAllowed()
	@Query(() => [SavedQuery], { nullable: true })
	async savedQueries(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		return this.savedQueryService.getMany(activeUser.id, {});
	}
}
