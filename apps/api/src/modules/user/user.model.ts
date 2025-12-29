import { Field, ObjectType } from '@nestjs/graphql';

import { UserPlan } from '~common/enums/user-plan.enum';
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

	@Field(() => UserPlan)
	plan: UserPlan;

	@Field(() => Date, { nullable: true })
	lastExportAt?: Date;

	@Field(() => String)
	storageUsageBytes: string;

	@Field(() => String)
	storageQuotaBytes: string;
}
