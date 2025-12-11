import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddArticleFromUrlInput {
	@Field()
	url!: string;

	@Field(() => [String], { nullable: true })
	labelIds?: string[];
}
