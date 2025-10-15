import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ExportService } from './export.service';
import { RequestExportInput } from './dto/request-export.input';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { VerifiedOnly } from '../../decorators/account.decorator';

@VerifiedOnly()
@Resolver()
export class ExportResolver {
	constructor(private readonly exportService: ExportService) {}

	@Mutation(() => String, { nullable: true })
	async requestExport(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: RequestExportInput,
	) {
		return this.exportService.exportData(activeUser.id, data);
	}
}
