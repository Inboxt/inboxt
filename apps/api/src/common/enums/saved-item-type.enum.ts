import { registerEnumType } from '@nestjs/graphql';

export enum SavedItemType {
	NEWSLETTER = 'NEWSLETTER',
	ARTICLE = 'ARTICLE',
}

registerEnumType(SavedItemType, {
	name: 'savedItemType',
	description: 'The type of a saved item',
});
