import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class Newsletter {
	@Field()
	contentHtml: string;

	@Field()
	contentText: string;
}
