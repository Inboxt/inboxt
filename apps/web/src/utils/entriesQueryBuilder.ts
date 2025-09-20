import { AppViews, SORT_VALUES } from '@inbox-reader/common';

import {
	EntryType,
	GetEntriesInput,
	HighlightSortField,
	SavedItemSortField,
	SavedItemStatus,
	SortDirection,
} from '~lib/graphql/generated/graphql';

type Sort = (typeof SORT_VALUES)[number];

type QueryBuilderOptions = {
	cursor?: string;
	pageSize?: number;
	sort?: Sort;
	labelId?: string;
};

// TODO: I feel like this is still far from ideal, especially when a search functionality will be added.
export function entriesQueryBuilder(
	view: AppViews | `label:${string}` = AppViews.INBOX,
	options: QueryBuilderOptions,
) {
	const { pageSize = 20, cursor } = options;

	const query: Pick<GetEntriesInput, 'first' | 'after' | 'types' | 'filter' | 'sort'> = {
		first: pageSize,
		types: [],
		filter: {},
		sort: {},
	};

	if (cursor) {
		query.after = cursor;
	}

	const wantSavedItems = (() => {
		if (view.startsWith('label:')) {
			return true;
		}
		switch (view) {
			case AppViews.HIGHLIGHTS:
				return false;
			default:
				return true;
		}
	})();

	const wantHighlights = (() => {
		if (view.startsWith('label:')) {
			return false;
		}
		return view === AppViews.HIGHLIGHTS;
	})();

	if (wantSavedItems && query.types && query.filter) {
		if (view.startsWith('label:')) {
			query.types.push(EntryType.Article, EntryType.Newsletter);
			query.filter.savedItems = {
				status: SavedItemStatus.Active,
				labelId: options.labelId,
			};
		} else {
			switch (view) {
				case AppViews.INBOX:
					query.types.push(EntryType.Article);
					query.filter.savedItems = {
						status: SavedItemStatus.Active,
						...(options.labelId ? { labelId: options.labelId } : {}),
					};
					break;

				case AppViews.NEWSLETTERS:
					query.types.push(EntryType.Newsletter);
					query.filter.savedItems = {
						status: SavedItemStatus.Active,
						...(options.labelId ? { labelId: options.labelId } : {}),
					};
					break;
				case AppViews.TRASH:
					query.types.push(EntryType.Article, EntryType.Newsletter);
					query.filter.savedItems = { status: SavedItemStatus.Deleted };
					break;
				case AppViews.ARCHIVE:
					query.types.push(EntryType.Article, EntryType.Newsletter);
					query.filter.savedItems = { status: SavedItemStatus.Archived };
					break;
				default:
					query.types.push(EntryType.Article);
					query.filter.savedItems = {
						status: SavedItemStatus.Active,
						...(options.labelId ? { labelId: options.labelId } : {}),
					};
					break;
			}
		}
	}

	if (wantHighlights && query.types && query.filter) {
		query.types.push(EntryType.Highlight);
		query.filter.highlights = {};
	}

	if (options.sort && query.sort) {
		const [field, dir] = options.sort.split('_') as [string, string];
		const direction = dir === 'asc' ? SortDirection.Asc : SortDirection.Desc;

		if (wantHighlights) {
			query.sort.highlight = {
				field: HighlightSortField.CreatedAt,
				direction,
			};
		}

		if (wantSavedItems) {
			query.sort.savedItem = {
				field:
					field === 'date' ? SavedItemSortField.CreatedAt : (field as SavedItemSortField),
				direction,
			};
		}
	}

	// If a sort object ended up empty, remove it to avoid sending {}
	if (query.sort && !query.sort.savedItem && !query.sort.highlight) {
		delete (query as { sort?: unknown }).sort;
	}

	return { query } satisfies { query: GetEntriesInput };
}
