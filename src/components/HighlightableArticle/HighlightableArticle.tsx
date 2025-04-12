import { useMemo, useRef } from 'react';
import { Box, Popover, Button } from '@mantine/core';
import { IconHighlight } from '@tabler/icons-react';

import classes from './HighlightableArticle.module.css';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { useTextHighlighting } from '../../hooks/useTextSelection.tsx';
import Markdown from 'react-markdown';
import { Route } from '../../routes/r.$id.tsx';

type ArticleWithHighlightsProps = {
	content: string;
};

export const HighlightableArticle = ({
	content,
}: ArticleWithHighlightsProps) => {
	const { format } = Route.useSearch();

	const isAboveMdScreen = useScreenQuery('md', 'above');
	const containerRef = useRef(null);
	const {
		selectedText,
		hasValidSelection,
		highlightSelection,
		rangeRect,
		isFullyHighlighted,
	} = useTextHighlighting(containerRef);

	const sanitizedContent = useMemo(
		() => ({
			__html: content,
		}),
		[content],
	);

	return (
		<>
			{format === 'markdown' ? (
				<Markdown>{content}</Markdown>
			) : (
				<Box
					ref={containerRef}
					dangerouslySetInnerHTML={sanitizedContent}
				></Box>
			)}

			{selectedText &&
				rangeRect &&
				hasValidSelection &&
				isAboveMdScreen && (
					<Popover
						opened
						withArrow
						position="top"
						withinPortal
						styles={{
							dropdown: {
								left:
									rangeRect.left +
									window.scrollX +
									rangeRect.width / 2,
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
									left:
										rangeRect.left +
										window.scrollX +
										rangeRect.width / 2,
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
								{isFullyHighlighted()
									? 'Unhighlight'
									: 'Highlight'}
							</Button>
						</Popover.Dropdown>
					</Popover>
				)}
		</>
	);
};
