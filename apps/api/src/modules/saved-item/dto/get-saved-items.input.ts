import { Field, InputType } from '@nestjs/graphql';
import { SavedItemStatus } from '../../../enums/saved-item-status.enum';

@InputType()
export class GetSavedItemsInput {
	@Field()
	first!: number;

	@Field({ nullable: true })
	after?: string;

	@Field(() => SavedItemStatus, { nullable: true })
	status?: SavedItemStatus;
}
