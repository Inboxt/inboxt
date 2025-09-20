import { Field, InputType, OmitType } from '@nestjs/graphql';
import { GetHighlightsInput } from '../../../modules/highlight/dto/get-highlights.input';
import { GetSavedItemsInput } from '../../../modules/saved-item/dto/get-saved-items.input';

@InputType()
export class SavedItemsFilterInput extends OmitType(GetSavedItemsInput, [
	'first',
	'after',
] as const) {}

@InputType()
export class HighlightsFilterInput extends OmitType(GetHighlightsInput, [
	'first',
	'after',
] as const) {}

@InputType()
export class EntryFilter {
	@Field(() => HighlightsFilterInput, { nullable: true })
	highlights?: HighlightsFilterInput;

	@Field(() => SavedItemsFilterInput, { nullable: true })
	savedItems?: SavedItemsFilterInput;
}
