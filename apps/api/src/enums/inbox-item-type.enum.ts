import { registerEnumType } from '@nestjs/graphql';

export enum InboxItemType {
	NEWSLETTER = 'NEWSLETTER',
	ARTICLE = 'ARTICLE',
}

registerEnumType(InboxItemType, {
	name: 'inboxItemType',
	description: 'The type of an inbox item',
});
