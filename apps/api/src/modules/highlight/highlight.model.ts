import { Field, ObjectType } from '@nestjs/graphql';
import { SavedItem } from '../saved-item/saved-item.model';
import { Entry } from '../../managers/entry-manager/entry.model';

@ObjectType({ implements: [Entry] })
export class Highlight implements Entry {
	@Field()
	id!: string;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => SavedItem, { nullable: true })
	savedItem?: SavedItem;
}
