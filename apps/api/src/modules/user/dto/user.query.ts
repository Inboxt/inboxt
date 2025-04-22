import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserQuery {
	@Field()
	id!: number;
}
