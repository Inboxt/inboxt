import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetUserInput {
	@Field()
	id!: number;
}
