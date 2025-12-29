import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Void {
	@Field()
	success!: boolean;
}
