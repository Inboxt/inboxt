import { Resolver, Query } from '@nestjs/graphql';

import { ActiveUserMeta } from '../../decorators/active-user-meta.decorator';
import { UserService } from '../user/user.service';
import { Public } from '../../decorators/public.decorator';
import { User } from '../user/user.model';

@Public()
@Resolver(() => User)
export class ActiveUserResolver {
	constructor(private userService: UserService) {}

	@Query(() => User, { nullable: true })
	async me(@ActiveUserMeta() user: { userId: number }) {
		if (!user?.userId) {
			return null;
		}

		return this.userService.get({
			where: { id: user.userId },
		});
	}
}
