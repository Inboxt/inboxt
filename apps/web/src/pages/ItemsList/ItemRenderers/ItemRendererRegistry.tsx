import { SavedItem, Highlight, SavedItemType } from '~lib/graphql/generated/graphql';

import { ArticleRenderer } from './ArticleRenderer';
import { HighlightRenderer } from './HighlightRenderer';
import { NewsletterRenderer } from './NewsletterRenderer';

export const ItemRenderer = ({ item }: { item: SavedItem | Highlight | null }) => {
	if (!item || !item.__typename) {
		console.warn('Item missing or has no __typename', item);
		return null;
	}

	switch (item.__typename) {
		case 'SavedItem':
			return item.type === SavedItemType.Newsletter ? (
				<NewsletterRenderer item={item} />
			) : (
				<ArticleRenderer item={item} />
			);

		case 'Highlight':
			return <HighlightRenderer highlight={item} />;

		default:
			console.warn(`Unknown item type: ${item.__typename as string}`, item);
			return <div>Unknown content type</div>;
	}
};
