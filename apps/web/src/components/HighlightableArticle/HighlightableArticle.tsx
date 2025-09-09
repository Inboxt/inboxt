import { Box } from '@mantine/core';
import { IconHighlight } from '@tabler/icons-react';
import { useMemo, useRef } from 'react';

import { HighlightPopover } from '~components/HighlightPopover';
import { useLongPress } from '~hooks/useLongPress';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';

type ArticleWithHighlightsProps = {
	content: string | null;
};

export const HighlightableArticle = ({ content }: ArticleWithHighlightsProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const containerRef = useRef(null);
	const {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		hoveredHighlight,
		hoveredRect,
		unhighlight,
	} = useTextHighlighting(containerRef);

	const sanitizedContent = useMemo(
		() => ({
			__html: content || '',
		}),
		[content],
	);

	const longPressHandlers = useLongPress(
		(ev) => {
			const target = ev.target as HTMLElement | null;
			const highlightEl = target?.closest('.highlight') as HTMLElement | null;
			if (highlightEl) {
				unhighlight(highlightEl);
			}
		},
		{ threshold: 700 },
	);

	const touchHandlers = {
		onTouchStart: (e: any) => {
			const target = e?.target as HTMLElement | null;
			if (target?.closest('.highlight')) {
				longPressHandlers.onTouchStart?.(e);
			}
		},
		onTouchEnd: longPressHandlers.onTouchEnd,
		onTouchCancel: longPressHandlers.onTouchCancel,
	};

	return (
		<>
			<Box
				ref={containerRef}
				id="highlight-container"
				dangerouslySetInnerHTML={sanitizedContent}
				{...touchHandlers}
			/>

			<HighlightPopover
				visible={!!selectedText && !!rangeRect && hasValidSelection && isAboveMdScreen}
				rect={rangeRect}
				buttonLabel="Highlight"
				buttonIcon={<IconHighlight size={21} />}
				onButtonClick={highlightSelection}
			/>

			<HighlightPopover
				visible={!selectedText && !!hoveredHighlight && !!hoveredRect && isAboveMdScreen}
				rect={hoveredRect}
				buttonLabel="Unhighlight"
				onButtonClick={() => unhighlight(hoveredHighlight as HTMLElement)}
			/>
		</>
	);
};
