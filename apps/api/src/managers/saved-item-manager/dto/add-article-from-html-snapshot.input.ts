import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddArticleFromHtmlSnapshotInput {
	@Field()
	url!: string;

	@Field()
	html!: string;
}
