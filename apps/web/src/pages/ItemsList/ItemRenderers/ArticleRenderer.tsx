import { ReaderItem } from '~components/ReaderItem';
import { SavedItem } from '~lib/graphql/generated/graphql';

export const ArticleRenderer = ({ item }: { item: SavedItem }) => {
	return <ReaderItem item={item} />;
};
