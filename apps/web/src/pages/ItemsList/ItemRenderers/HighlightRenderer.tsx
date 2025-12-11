import { Highlight } from '@inboxt/graphql';

import { HighlightItem } from '~components/HighlightItem/HighlightItem';

export const HighlightRenderer = ({ highlight }: { highlight: Highlight }) => {
	return <HighlightItem highlight={highlight} />;
};
