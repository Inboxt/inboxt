import { Field, InputType } from '@nestjs/graphql';

import { SortDirection } from '../enums/sort-direction.enum';

@InputType({ isAbstract: true })
export abstract class Sort {
	@Field(() => SortDirection)
	direction: SortDirection;
}
