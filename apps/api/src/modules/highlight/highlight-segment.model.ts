import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HighlightSegment {
	@Field()
	id!: string;

	@Field()
	xpath: string;

	@Field()
	beforeText: string;

	@Field()
	afterText: string;

	@Field()
	startOffset: number;

	@Field()
	endOffset: number;

	@Field({ nullable: true })
	text?: string;
}
