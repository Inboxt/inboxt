import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteSavedQueryInput {
	@Field()
	id!: string;
}
