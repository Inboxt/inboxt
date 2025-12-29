import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '~common/models/base.model';

@ObjectType()
export class ApiToken extends BaseModel {
	@Field({ nullable: true })
	lastUsedAt?: Date;

	@Field()
	name: string;

	@Field(() => Date, { nullable: true })
	expiresAt?: Date;
}

@ObjectType()
export class CreatedApiToken {
	@Field(() => ApiToken)
	token: ApiToken;

	@Field()
	secret: string;
}
