import { Field, InputType } from '@nestjs/graphql';
import { CreateHighlightSegmentInput } from './create-highlight-segment.input';

@InputType()
export class CreateHighlightInput {
	@Field()
	savedItemId!: string;

	@Field(() => [CreateHighlightSegmentInput])
	segments!: CreateHighlightSegmentInput[];
}
