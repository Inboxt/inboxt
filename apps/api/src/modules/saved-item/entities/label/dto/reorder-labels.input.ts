import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ReorderLabelsInput {
	@Field(() => [String])
	ids: string[];
}
