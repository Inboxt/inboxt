import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
	@Field()
	id!: number;

	@Field(() => Date)
	createdAt!: Date;
}
