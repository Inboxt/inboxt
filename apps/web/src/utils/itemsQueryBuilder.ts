import { AppViews } from '../constants';

const SORT_OPTIONS = ['date_asc', 'date_desc', 'title_asc', 'title_desc'] as const;
type Sort = (typeof SORT_OPTIONS)[number];
type SortDirection = 'asc' | 'desc';

type ItemsQueryVariables = {
	query: {
		first: number;
		status?: string;
		type?: 'ARTICLE' | 'NEWSLETTER';
		after?: string;
		sort?: {
			field: string;
			direction: 'asc' | 'desc';
		};
		labelId?: string;
	};
};

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
	const variables: ItemsQueryVariables = {
		query: {
			first: pageSize,
		},
	};

	if (cursor) {
		variables.query.after = cursor;
	}

	if (options.sort) {
		const [field, direction] = options.sort.split('_') as [string, SortDirection];
		if (field && direction) {
			variables.query.sort = {
				field: field === 'date' ? 'createdAt' : field,
				direction,
			};
		}
	}

	if (typeof view === 'string' && view.startsWith('label:')) {
		variables.query.status = 'ACTIVE';
		if (options.labelId) {
			variables.query.labelId = options.labelId;
		}
	} else {
		switch (view) {
			case AppViews.INBOX:
				variables.query.type = 'ARTICLE';
				variables.query.status = 'ACTIVE';
				break;

			case AppViews.NEWSLETTERS:
				variables.query.type = 'NEWSLETTER';
				variables.query.status = 'ACTIVE';
				break;

			case AppViews.TRASH:
				variables.query.status = 'DELETED';
				break;

			case AppViews.ARCHIVE:
				variables.query.status = 'ARCHIVED';
				break;

			case AppViews.HIGHLIGHTS:
				break;
		}
	}

	return variables;
}
