import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetSavedItemLabelsInput {
	@Field()
	id!: number;

	@Field(() => [Number])
	labelIds!: number[];
}
