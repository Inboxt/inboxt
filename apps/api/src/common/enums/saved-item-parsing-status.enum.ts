import { registerEnumType } from '@nestjs/graphql';

export enum SavedItemParsingStatus {
	FAILED = 'FAILED',
	PROCESSING = 'PROCESSING',
	PARSED = 'PARSED',
}

registerEnumType(SavedItemParsingStatus, {
	name: 'SavedItemParsingStatus',
	description: 'The parsing status of a saved item',
});
