import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetEntriesInput } from './dto/get-entries.input';
import { EntryManagerService } from './entry-manager.service';
import { EntryConnection } from './entry-connection';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';

@Resolver()
export class EntryManagerResolver {
	constructor(private entryManagerService: EntryManagerService) {}

	@Query(() => EntryConnection)
	async entries(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('query') query: GetEntriesInput,
	) {
		return this.entryManagerService.getMany(activeUser.id, query);
	}
}
