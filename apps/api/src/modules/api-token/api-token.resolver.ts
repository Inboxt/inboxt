import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ApiTokenService } from './api-token.service';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { ApiToken, CreatedApiToken } from './api-token.model';
import { CreateApiTokenInput } from './dto/create-api-token.input';
import { ApiTokenAllowed } from '../../decorators/api-token.decorator';
import { VerifiedOnly } from '../../decorators/account.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
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
