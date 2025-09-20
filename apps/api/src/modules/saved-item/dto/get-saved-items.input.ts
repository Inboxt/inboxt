import { Field, InputType } from '@nestjs/graphql';
import { SavedItemStatus } from '../../../enums/saved-item-status.enum';
import { SavedItemType } from 'src/enums/saved-item-type.enum';
import { SavedItemSort } from './saved-item-sort.input';
import { PaginationInput } from '../../../common/dto/pagination.input';

@InputType()
export class GetSavedItemsInput extends PaginationInput {
	@Field(() => SavedItemStatus, { nullable: true })
	status?: SavedItemStatus;

	@Field(() => SavedItemType, { nullable: true })
	type?: SavedItemType;

	@Field(() => SavedItemSort, { nullable: true })
	sort?: SavedItemSort;

	@Field({ nullable: true })
	labelId?: string;
}
