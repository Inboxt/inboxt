import { Field, ObjectType } from '@nestjs/graphql';
import { Void } from '../../../models/void.model';

@ObjectType()
export class EmptyTrash extends Void {
	@Field()
	count!: number;
}
