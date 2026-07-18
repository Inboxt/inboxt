import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateSavedItemsReadStatusInput {
	@Field(() => [String])
	ids!: string[];

	@Field()
	isRead!: boolean;
}
