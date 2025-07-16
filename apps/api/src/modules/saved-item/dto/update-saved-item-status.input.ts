import { Field, InputType } from '@nestjs/graphql';
import { SavedItemStatus } from '../../../enums/saved-item-status.enum';

@InputType()
export class UpdateSavedItemStatusInput {
	@Field(() => [Number])
	ids!: number[];

	@Field(() => SavedItemStatus)
	status!: SavedItemStatus;
}
