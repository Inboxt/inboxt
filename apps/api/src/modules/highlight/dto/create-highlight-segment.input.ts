import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateHighlightSegmentInput {
	@Field()
	xpath!: string;

	@Field(() => Int)
	startOffset!: number;

	@Field(() => Int)
	endOffset!: number;

	@Field({ nullable: true })
	text?: string;

	@Field()
	beforeText!: string;

	@Field()
	afterText!: string;
}
