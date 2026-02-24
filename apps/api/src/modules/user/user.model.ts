import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '~common/models/base.model';

@ObjectType({ isAbstract: true })
export class User extends BaseModel {
	@Field()
	emailAddress: string;

	@Field({ nullable: true })
	pendingEmailAddress?: string;

	@Field()
	isEmailVerified: boolean;

	@Field()
	username: string;
}
