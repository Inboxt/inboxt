import { Resolver, Query } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { UserService } from '../user/user.service';
import { Public } from '../../decorators/public.decorator';
import { User } from '../user/user.model';

@Public()
@Resolver(() => User)
export class ActiveUserResolver {
	constructor(private userService: UserService) {}

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
