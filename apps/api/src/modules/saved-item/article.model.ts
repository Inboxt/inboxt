import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class Article {
	@Field()
	contentHtml: string;

	@Field()
	contentText: string;
}
