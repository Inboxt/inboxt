import { Field, ObjectType } from '@nestjs/graphql';

import { Entry } from '~managers/entry-manager/entry.model';
import { SavedItem } from '~modules/saved-item/saved-item.model';

@ObjectType({ implements: [Entry] })
export class Highlight implements Entry {
	@Field()
	id!: string;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => SavedItem, { nullable: true })
	savedItem?: SavedItem;
}
