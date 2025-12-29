import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '~common/models/base.model';

@ObjectType({ isAbstract: true })
export class InboundEmailAddress extends BaseModel {
	@Field()
	fullAddress: string;
}
