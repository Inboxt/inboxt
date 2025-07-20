import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PermanentlyDeleteSavedItemsInput {
	@Field(() => [String])
	ids!: string[];
}
