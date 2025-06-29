import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';
import { UserPlan } from '../../enums/user-plan.enum';

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

	@Field(() => UserPlan)
	plan: UserPlan;
}
