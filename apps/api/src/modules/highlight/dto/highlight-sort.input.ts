import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Sort } from '../../../common/dto/sort';

export enum HighlightSortField {
	title = 'title',
	createdAt = 'createdAt',
}

registerEnumType(HighlightSortField, {
	name: 'HighlightSortField',
	description: 'Properties by which highlight can be sorted.',
});

@InputType()
export class HighlightSort extends Sort {
	@Field(() => HighlightSortField)
	field?: HighlightSortField;
}
