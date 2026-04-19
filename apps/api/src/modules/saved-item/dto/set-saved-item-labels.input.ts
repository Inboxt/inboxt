import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetSavedItemLabelsInput {
	@Field({ nullable: true })
	id?: string;

	@Field(() => [String], { nullable: true })
	ids?: string[];

	@Field(() => [String], { nullable: true })
	labelIds?: string[];

	@Field(() => [String], { nullable: true })
	addLabelIds?: string[];

	@Field(() => [String], { nullable: true })
	removeLabelIds?: string[];
}
