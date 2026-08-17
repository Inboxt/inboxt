import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ReorderSavedQueriesInput {
	@Field(() => [String])
	ids: string[];
}
