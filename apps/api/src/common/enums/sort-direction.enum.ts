import { registerEnumType } from '@nestjs/graphql';

export enum SortDirection {
	asc = 'asc',
	desc = 'desc',
}

registerEnumType(SortDirection, {
	name: 'SortDirection',
	description: 'Possible directions for sorting a list of items',
});
