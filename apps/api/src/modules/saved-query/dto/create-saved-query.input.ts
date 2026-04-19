import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSavedQueryInput {
	@Field()
	name!: string;

	@Field()
	query!: string;
}
