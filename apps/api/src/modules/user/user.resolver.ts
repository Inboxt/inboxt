import { Resolver, Query, Args } from '@nestjs/graphql';

import { User } from './user.model';
import { UserService } from './user.service';
import { UserQuery } from './dto/user.query';

@Resolver(() => User)
export class UserResolver {
	constructor(private userService: UserService) {}

	/* ===============================
	=            Queries             =
	=============================== */
	@Query(() => User)
	async user(@Args('query') userQuery: UserQuery) {
		return this.userService.get(userQuery);
	}
}
