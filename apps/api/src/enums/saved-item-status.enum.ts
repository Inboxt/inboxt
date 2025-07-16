import { registerEnumType } from '@nestjs/graphql';

export enum SavedItemStatus {
	ACTIVE = 'ACTIVE',
	ARCHIVED = 'ARCHIVED',
	DELETED = 'DELETED',
}

registerEnumType(SavedItemStatus, {
	name: 'savedItemStatus',
	description: 'The status of a saved item',
});
