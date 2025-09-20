import { Field, ObjectType } from '@nestjs/graphql';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { SavedItemStatus } from '../../enums/saved-item-status.enum';
import { Entry } from '../../managers/entry-manager/entry.model';

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
	description?: 'text';

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
}
