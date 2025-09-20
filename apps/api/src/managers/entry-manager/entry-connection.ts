import { Field, ObjectType } from '@nestjs/graphql';
import { Entry } from './entry.model';

@ObjectType()
export class EntryEdge {
	@Field(() => Entry)
	node: Entry;

	@Field()
	cursor: string;
}

@ObjectType()
export class EntryConnection {
	@Field(() => [EntryEdge])
	edges: EntryEdge[];

	@Field()
	hasNextPage: boolean;

	@Field({ nullable: true })
	endCursor?: string;
}
