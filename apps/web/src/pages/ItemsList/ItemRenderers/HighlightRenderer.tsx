import { HighlightItem } from '~components/HighlightItem';
import { Highlight } from '~lib/graphql';

export const HighlightRenderer = ({ highlight }: { highlight: Highlight }) => {
	return <HighlightItem highlight={highlight} />;
};
