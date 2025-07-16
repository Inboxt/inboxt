import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../../models/base.model';

@ObjectType({ isAbstract: true })
export class Label extends BaseModel {
	@Field()
	name: string;

	@Field()
	color: string;
}
