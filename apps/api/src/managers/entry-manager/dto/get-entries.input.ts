import { Field, InputType } from '@nestjs/graphql';
import { PaginationInput } from '../../../common/dto/pagination.input';
import { EntrySort } from './entry-sort.input';

@InputType()
export class GetEntriesInput extends PaginationInput {
	@Field({ nullable: true })
	q?: string;

	@Field(() => EntrySort, { nullable: true })
	sort?: EntrySort;
}
