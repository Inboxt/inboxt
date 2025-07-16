import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { SavedItemStatus } from '../../enums/saved-item-status.enum';

@ObjectType({ isAbstract: true })
export class SavedItem extends BaseModel {
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
