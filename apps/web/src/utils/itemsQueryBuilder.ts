import { AppViews, SORT_VALUES } from '@inbox-reader/common';

import {
	SavedItemSortField,
	SavedItemsQueryVariables,
	SavedItemStatus,
	SavedItemType,
	SortDirection,
} from '~lib/graphql/generated/graphql';

type Sort = (typeof SORT_VALUES)[number];

type QueryBuilderOptions = {
	cursor?: string;
	pageSize?: number;
	sort?: Sort;
	labelId?: string;
};

export function itemsQueryBuilder(
	view: AppViews | `label:${string}` = AppViews.INBOX,
	options: QueryBuilderOptions,
) {
	const { pageSize = 20, cursor } = options;
	const variables: SavedItemsQueryVariables = {
		query: {
			first: pageSize,
		},
	};

	if (cursor) {
		variables.query.after = cursor;
	}

	if (options.sort) {
		const [field, direction] = options.sort.split('_') as [string, string];
		if (field && direction) {
			const sortField =
				field === 'date'
					? SavedItemSortField.CreatedAt
					: field === 'title'
						? SavedItemSortField.Title
						: SavedItemSortField.CreatedAt;

			const sortDirection = direction === 'asc' ? SortDirection.Asc : SortDirection.Desc;

			variables.query.sort = {
				field: sortField,
				direction: sortDirection,
			};
		}
	}

	if (view.startsWith('label:')) {
		variables.query.status = SavedItemStatus.Active;
		if (options.labelId) {
			variables.query.labelId = options.labelId;
		}
	} else {
		switch (view) {
			case AppViews.INBOX:
				variables.query.type = SavedItemType.Article;
				variables.query.status = SavedItemStatus.Active;
				break;

			case AppViews.NEWSLETTERS:
				variables.query.type = SavedItemType.Newsletter;
				variables.query.status = SavedItemStatus.Active;
				break;

			case AppViews.TRASH:
				variables.query.status = SavedItemStatus.Deleted;
				break;

			case AppViews.ARCHIVE:
				variables.query.status = SavedItemStatus.Archived;
				break;

			case AppViews.HIGHLIGHTS:
				break;
		}
	}

	return variables;
}
