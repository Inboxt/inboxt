import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteHighlightInput {
	@Field()
	id!: string;

	@Field()
	savedItemId!: string;
}
