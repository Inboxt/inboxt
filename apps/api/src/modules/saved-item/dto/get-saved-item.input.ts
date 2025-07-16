import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetSavedItemInput {
	@Field()
	id!: number;
}
