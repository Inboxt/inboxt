import { Box, Skeleton } from '@mantine/core';
import { IconHighlight } from '@tabler/icons-react';
import { useMemo, useRef, useEffect, useState } from 'react';

import { HighlightPopover } from '~components/HighlightPopover';
import { useLongPress } from '~hooks/useLongPress';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';
import { SavedItem } from '~lib/graphql/generated/graphql.ts';
import { applyHighlightsToDOM } from '~utils/highlightsDOM.ts';

type ArticleWithHighlightsProps = {
	content: string | null;
	data: SavedItem;
};

export const HighlightableArticle = ({ content, data }: ArticleWithHighlightsProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const containerRef = useRef<HTMLDivElement>(null);
	const [applyingHighlights, setApplyingHighlights] = useState(false);

	const {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		hoveredHighlight,
		hoveredRect,
		unhighlight,
	} = useTextHighlighting(containerRef, data.id);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const container = containerRef.current as HTMLElement;
		const highlights = data.highlights;
		if (!highlights || highlights.length === 0) {
			setApplyingHighlights(false);
			return;
		}

		let cancelled = false;
		setApplyingHighlights(true);
		setTimeout(() => {
			if (!cancelled) {
				try {
					applyHighlightsToDOM(container, highlights);
				} finally {
					setApplyingHighlights(false);
				}
			}
		}, 0);

		return () => {
			cancelled = true;
		};
	}, [containerRef, data.highlights, content]);

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
				void unhighlight(highlightEl);
			}
		},
		{ threshold: 700 },
	);

	const touchHandlers = {
		onTouchStart: (e) => {
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
			<Skeleton visible={applyingHighlights} height={560}>
				<Box
					ref={containerRef}
					id="highlight-container"
					dangerouslySetInnerHTML={sanitizedContent}
					style={{ visibility: applyingHighlights ? 'hidden' : 'visible' }}
					pb="xxl"
					{...touchHandlers}
				/>
			</Skeleton>

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
				onButtonClick={() => void unhighlight(hoveredHighlight)}
			/>
		</>
	);
};
