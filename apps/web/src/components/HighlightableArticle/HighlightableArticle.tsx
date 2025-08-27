import { Box, Popover, Button } from '@mantine/core';
import { IconHighlight } from '@tabler/icons-react';
import { useMemo, useRef } from 'react';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';

import classes from './HighlightableArticle.module.css';

type ArticleWithHighlightsProps = {
	content: string | null;
};

export const HighlightableArticle = ({ content }: ArticleWithHighlightsProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const containerRef = useRef(null);
	const { selectedText, hasValidSelection, highlightSelection, rangeRect, isFullyHighlighted } =
		useTextHighlighting(containerRef);

	const sanitizedContent = useMemo(
		() => ({
			__html: content || '',
		}),
		[content],
	);

	return (
		<>
			<Box
				ref={containerRef}
				id="highlight-container"
				dangerouslySetInnerHTML={sanitizedContent}
			></Box>

			{selectedText && rangeRect && hasValidSelection && isAboveMdScreen && (
				<Popover
					opened
					withArrow
					position="top"
					withinPortal
					styles={{
						dropdown: {
							left: rangeRect.left + window.scrollX + rangeRect.width / 2,
							transform: 'translateX(-50%)',
						},
					}}
					classNames={{
						arrow: classes.popoverArrow,
						dropdown: classes.popoverDropdown,
					}}
					arrowSize={12}
					radius={6}
				>
					<Popover.Target>
						<Box
							style={{
								top: rangeRect.top + window.scrollY,
								left: rangeRect.left + window.scrollX + rangeRect.width / 2,
								transform: 'translateX(-50%)',
							}}
							className={classes.popoverContent}
						/>
					</Popover.Target>
					<Popover.Dropdown>
						<Button
							variant="transparent"
							color="white"
							size="compact-sm"
							leftSection={<IconHighlight size={21} />}
							onClick={highlightSelection}
						>
							{isFullyHighlighted() ? 'Unhighlight' : 'Highlight'}
						</Button>
					</Popover.Dropdown>
				</Popover>
			)}
		</>
	);
};
