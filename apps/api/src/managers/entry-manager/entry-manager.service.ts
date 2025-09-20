import { Injectable } from '@nestjs/common';
import { GetEntriesInput } from './dto/get-entries.input';
import { SavedItemService } from '../../modules/saved-item/saved-item.service';
import { HighlightService } from '../../modules/highlight/highlight.service';
import { EntryEdge } from './entry-connection';
import { SavedItemType } from '../../enums/saved-item-type.enum';
import { EntryType } from '../../common/enums/entry-type.enum';
import { GetSavedItemsInput } from '../../modules/saved-item/dto/get-saved-items.input';
import { GetHighlightsInput } from '../../modules/highlight/dto/get-highlights.input';

@Injectable()
export class EntryManagerService {
	constructor(
		private savedItemService: SavedItemService,
		private highlightService: HighlightService,
	) {}

	async getMany(userId: string, input: GetEntriesInput) {
		const { filter, first, after, sort, types: inputTypes } = input;
		const types = inputTypes || Object.values(EntryType);

		const savedItems: EntryEdge[] = [];
		const highlights: EntryEdge[] = [];

		// Fetch saved items if needed
		if (types.some((t) => t === EntryType.ARTICLE || t === EntryType.NEWSLETTER)) {
			// Correct mapping to enums
			let savedItemType: SavedItemType | undefined;
			if (types.includes(EntryType.ARTICLE)) {
				savedItemType = SavedItemType.ARTICLE;
			} else if (types.includes(EntryType.NEWSLETTER)) {
				savedItemType = SavedItemType.NEWSLETTER;
			}

			const savedItemsArgs: GetSavedItemsInput = {
				first,
				after,
				type: savedItemType,
				// Filter and sort fields for saved items
				status: filter?.savedItems?.status,
				labelId: filter?.savedItems?.labelId,
				sort: sort?.savedItem,
			};

			const savedItemsResult = await this.savedItemService.getPaginated(
				userId,
				savedItemsArgs,
			);

			savedItemsResult.edges.forEach((edge) => {
				savedItems.push({
					node: {
						...edge.node,
					},
					cursor: edge.cursor,
				});
			});
		}

		// Fetch highlights if needed
		if (types.includes(EntryType.HIGHLIGHT)) {
			const highlightsArgs: GetHighlightsInput = {
				first,
				after,
				// Filter and sort fields for highlights
				sort: sort?.highlight,
			};

			const highlightsResult = await this.highlightService.getPaginated(
				userId,
				highlightsArgs,
			);

			highlightsResult.edges.forEach((edge) => {
				highlights.push({
					node: {
						...edge.node,
					},
					cursor: edge.cursor,
				});
			});
		}

		const allContent: EntryEdge[] = [...savedItems, ...highlights];
		const edges = allContent.slice(0, first);

		return {
			edges,
			hasNextPage: allContent.length > first,
			endCursor: edges.length ? edges[edges.length - 1].cursor : undefined,
		};
	}
}
