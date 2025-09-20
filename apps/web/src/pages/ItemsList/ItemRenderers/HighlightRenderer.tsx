import { HighlightItem } from '~components/HighlightItem/HighlightItem';
import { Highlight } from '~lib/graphql/generated/graphql';

export const HighlightRenderer = ({ highlight }: { highlight: Highlight }) => {
	return <HighlightItem highlight={highlight} />;
};
