import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';

@ObjectType({ isAbstract: true })
export class InboundEmailAddress extends BaseModel {
	@Field()
	fullAddress: string;
}
