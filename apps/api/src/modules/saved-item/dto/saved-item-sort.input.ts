import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Sort } from '../../../common/dto/sort';

export enum SavedItemSortField {
	title = 'title',
	createdAt = 'createdAt',
}

registerEnumType(SavedItemSortField, {
	name: 'SavedItemSortField',
	description: 'Properties by which saved items can be sorted.',
});

@InputType()
export class SavedItemSort extends Sort {
	@Field(() => SavedItemSortField)
	field?: SavedItemSortField;
}
