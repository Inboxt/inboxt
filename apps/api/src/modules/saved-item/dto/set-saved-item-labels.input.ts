import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetSavedItemLabelsInput {
	@Field()
	id!: string;

	@Field(() => [String])
	labelIds!: string[];
}
