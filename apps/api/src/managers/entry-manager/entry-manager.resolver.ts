import { Resolver, Query, Args } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';

import { GetEntriesInput } from './dto/get-entries.input';
import { EntryConnection } from './entry-connection';
import { EntryManagerService } from './entry-manager.service';

@Resolver()
export class EntryManagerResolver {
	constructor(private readonly entryManagerService: EntryManagerService) {}

	@ApiTokenAllowed()
	@Query(() => EntryConnection)
	async entries(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('query') query: GetEntriesInput,
	) {
		return this.entryManagerService.getMany(activeUser.id, query);
	}
}
