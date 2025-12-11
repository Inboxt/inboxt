import { SavedItem } from '@inboxt/graphql';

import { ReaderItem } from '~components/ReaderItem';

export const NewsletterRenderer = ({ item }: { item: SavedItem }) => {
	return <ReaderItem item={item} />;
};
