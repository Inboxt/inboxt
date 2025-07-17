import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
	@Field()
	id!: string;

	@Field(() => Date)
	createdAt!: Date;
}
