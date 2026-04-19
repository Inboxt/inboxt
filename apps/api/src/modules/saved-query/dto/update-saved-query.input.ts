import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateSavedQueryInput {
	@Field()
	id!: string;

	@Field()
	name: string;

	@Field()
	query: string;
}
