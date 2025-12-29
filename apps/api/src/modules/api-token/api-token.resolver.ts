import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';

import { ApiToken, CreatedApiToken } from './api-token.model';
import { ApiTokenService } from './api-token.service';
import { CreateApiTokenInput } from './dto/create-api-token.input';
import { DeleteApiTokenInput } from './dto/delete-api-token.input';

@Resolver()
export class ApiTokenResolver {
	constructor(private readonly apiTokenService: ApiTokenService) {}

	@VerifiedOnly()
	@Mutation(() => CreatedApiToken)
	async createApiToken(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') input: CreateApiTokenInput,
	) {
		return this.apiTokenService.createToken(user.id, input);
	}

	@ApiTokenAllowed()
	@Query(() => [ApiToken])
	async apiTokens(@ActiveUserMeta() user: ActiveUserMetaType) {
		return this.apiTokenService.getMany(user.id);
	}

	@VerifiedOnly()
	@Mutation(() => Void)
	async deleteApiToken(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') input: DeleteApiTokenInput,
	) {
		await this.apiTokenService.delete(user.id, input.id);
		return VOID_RESPONSE;
	}
}
