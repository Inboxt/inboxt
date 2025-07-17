import { Field, InputType } from '@nestjs/graphql';
import { SavedItemStatus } from '../../../enums/saved-item-status.enum';

@InputType()
export class UpdateSavedItemStatusInput {
	@Field(() => [String])
	ids!: string[];

	@Field(() => SavedItemStatus)
	status!: SavedItemStatus;
}
