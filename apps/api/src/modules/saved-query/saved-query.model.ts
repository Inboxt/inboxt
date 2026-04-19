import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '~common/models/base.model';

@ObjectType()
export class SavedQuery extends BaseModel {
	@Field()
	name: string;

	@Field()
	query: string;
}
