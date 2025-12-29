import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Sort } from '~common/dto/sort';

export enum EntrySortField {
	title = 'title',
	createdAt = 'createdAt',
}

registerEnumType(EntrySortField, {
	name: 'EntrySortField',
	description: 'Properties by which entries can be sorted.',
});

@InputType()
export class EntrySort extends Sort {
	@Field(() => EntrySortField)
	field?: EntrySortField;
}
