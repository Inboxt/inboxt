import { registerEnumType } from '@nestjs/graphql';

export enum EntryType {
	ARTICLE = 'ARTICLE',
	NEWSLETTER = 'NEWSLETTER',
	HIGHLIGHT = 'HIGHLIGHT',
}

registerEnumType(EntryType, {
	name: 'EntryType',
	description: 'Types of user content',
});
