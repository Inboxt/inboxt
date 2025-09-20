import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteHighlightItemInput {
	@Field()
	id!: string;

	@Field({ nullable: true })
	savedItemId?: string;
}

@InputType()
export class DeleteHighlightsInput {
	@Field(() => [DeleteHighlightItemInput])
	items!: DeleteHighlightItemInput[];
}
