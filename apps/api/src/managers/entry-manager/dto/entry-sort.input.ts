import { Field, InputType } from '@nestjs/graphql';

import { HighlightSort } from '../../../modules/highlight/dto/highlight-sort.input';
import { SavedItemSort } from '../../../modules/saved-item/dto/saved-item-sort.input';

@InputType()
export class EntrySort {
	@Field(() => HighlightSort, { nullable: true })
	highlight?: HighlightSort;

	@Field(() => SavedItemSort, { nullable: true })
	savedItem?: SavedItemSort;
}
