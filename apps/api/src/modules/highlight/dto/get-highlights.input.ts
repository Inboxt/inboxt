import { Field, InputType } from '@nestjs/graphql';
import { HighlightSort } from './highlight-sort.input';
import { PaginationInput } from '../../../common/dto/pagination.input';

@InputType()
export class GetHighlightsInput extends PaginationInput {
	@Field(() => HighlightSort, { nullable: true })
	sort?: HighlightSort;
}
