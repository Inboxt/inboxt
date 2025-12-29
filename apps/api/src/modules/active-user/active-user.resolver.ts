import { Resolver, Query } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Public } from '~common/decorators/public.decorator';
import { User } from '~modules/user/user.model';
import { UserService } from '~modules/user/user.service';

@Public()
@Resolver(() => User)
export class ActiveUserResolver {
	constructor(private readonly userService: UserService) {}

	@ApiTokenAllowed()
	@Query(() => User, { nullable: true })
	async me(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		if (!activeUser?.id) {
			return null;
		}

		return this.userService.get({
			where: { id: activeUser.id },
		});
	}
}
