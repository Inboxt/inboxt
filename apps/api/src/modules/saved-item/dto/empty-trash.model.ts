import { Field, ObjectType } from '@nestjs/graphql';

import { Void } from '~common/models/void.model';

@ObjectType()
export class EmptyTrash extends Void {
	@Field()
	count!: number;
}
