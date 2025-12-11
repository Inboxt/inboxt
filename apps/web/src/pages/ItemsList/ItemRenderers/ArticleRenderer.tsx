import { SavedItem } from '@inboxt/graphql';

import { ReaderItem } from '~components/ReaderItem';

export const ArticleRenderer = ({ item }: { item: SavedItem }) => {
	return <ReaderItem item={item} />;
};
