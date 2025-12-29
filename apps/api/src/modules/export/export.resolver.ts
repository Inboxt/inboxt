import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';

import { RequestExportInput } from './dto/request-export.input';
import { ExportService } from './export.service';

@VerifiedOnly()
@Resolver()
export class ExportResolver {
	constructor(private readonly exportService: ExportService) {}

	@Mutation(() => String, { nullable: true })
	@RateLimit({
		user: { points: 15, duration: 60 * 60 },
	})
	async requestExport(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: RequestExportInput,
	) {
		return this.exportService.exportData(activeUser.id, data);
	}
}
