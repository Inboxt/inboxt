import { Field, ObjectType } from '@nestjs/graphql';

import { SavedItemStatus } from '~common/enums/saved-item-status.enum';
import { SavedItemType } from '~common/enums/saved-item-type.enum';
import { Entry } from '~managers/entry-manager/entry.model';

@ObjectType({ implements: [Entry] })
export class SavedItem implements Entry {
	@Field()
	id!: string;

	@Field(() => Date)
	createdAt!: Date;

	@Field()
	title: string;

	@Field({ nullable: true })
	originalUrl?: string;

	@Field({ nullable: true })
	sourceDomain?: string;

	@Field({ nullable: true })
	description?: string;

	@Field({ nullable: true })
	leadImage?: string;

	@Field()
	wordCount: number;

	@Field({ nullable: true })
	author?: string;

	@Field(() => SavedItemType)
	type: SavedItemType;

	@Field(() => SavedItemStatus)
	status: SavedItemStatus;

	@Field({ nullable: true })
	readingProgress?: number;

	@Field({ nullable: true })
	readAt?: Date;

	@Field()
	isReadManual: boolean;
}
