import { Field, InterfaceType } from '@nestjs/graphql';
import { BaseModel } from '../../models/base.model';

@InterfaceType({
	resolveType(value) {
		if ('type' in value || value?.__typename === 'SavedItem') {
			return 'SavedItem';
		}

		if ('savedItemId' in value || value?.__typename === 'Highlight') {
			return 'Highlight';
		}

		return null;
	},
})
export class Entry implements BaseModel {
	@Field()
	id!: string;

	@Field(() => Date)
	createdAt!: Date;
}
