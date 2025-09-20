import { Field, InputType } from '@nestjs/graphql';
import { EntryFilter } from './entry-filter';
import { PaginationInput } from '../../../common/dto/pagination.input';
import { EntrySort } from './entry-sort.input';
import { EntryType } from '../../../common/enums/entry-type.enum';

@InputType()
export class GetEntriesInput extends PaginationInput {
	@Field(() => [EntryType], { nullable: true })
	types?: EntryType[];

	@Field(() => EntryFilter, { nullable: true })
	filter?: EntryFilter;

	@Field(() => EntrySort, { nullable: true })
	sort?: EntrySort;
}
