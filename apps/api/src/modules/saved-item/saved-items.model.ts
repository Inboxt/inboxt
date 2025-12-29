import { ObjectType, Field } from '@nestjs/graphql';

import { SavedItem } from './saved-item.model';

@ObjectType()
export class SavedItemEdge {
	@Field(() => SavedItem)
	node: SavedItem;

	@Field()
	cursor: string;
}

@ObjectType()
export class SavedItemConnection {
	@Field(() => [SavedItemEdge])
	edges: SavedItemEdge[];

	@Field({ nullable: true })
	endCursor?: string;

	@Field()
	hasNextPage: boolean;
}
