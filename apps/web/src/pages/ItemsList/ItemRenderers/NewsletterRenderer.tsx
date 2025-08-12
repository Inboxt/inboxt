import { ReaderItem } from '~components/ReaderItem';
import { SavedItem } from '~lib/graphql/generated/graphql';

export const NewsletterRenderer = ({ item }: { item: SavedItem }) => {
	return <ReaderItem item={item} />;
};
