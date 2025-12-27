import { Box, Breadcrumbs, Group, Stack, Text } from '@mantine/core';
import { useHover, useLongPress } from '@mantine/hooks';
import { IconQuoteFilled } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { ItemsOptions } from '~components/ItemsOptions';
import { ReaderCheckbox } from '~components/ReaderCheckbox';
import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery.tsx';
import { Highlight } from '~lib/graphql';

import classes from './HighlightItem.module.css';

type HighlightItemProps = {
	highlight: Highlight;
};

export const HighlightItem = ({ highlight }: HighlightItemProps) => {
	const { hovered, ref } = useHover();
	const navigate = useNavigate();
	const isBelowLgScreen = useScreenQuery('lg', 'below');

	const { selectedItems, toggleItemSelection, isSelected } = useContentSelection();
	const selected = isSelected(highlight.id);
	const handleLongPress = () => {
		toggleItemSelection(highlight);
	};

	const longPressHandlers = useLongPress(handleLongPress);
	const sourceTitle = highlight.savedItem?.title || 'Unknown Title';

	return (
		<Stack
			p="md"
			className={classes.highlight}
			onClick={() => {
				if (selectedItems.length > 0) {
					toggleItemSelection(highlight);

					return;
				}

				if (highlight.savedItem?.id) {
					void navigate({ to: `/r/${highlight.savedItem.id}` });
				}
			}}
			ref={ref}
			{...longPressHandlers}
		>
			<Group wrap="nowrap" maw="100%">
				<ReaderCheckbox
					checked={selected}
					onChange={() => toggleItemSelection(highlight)}
					onClick={(e) => {
						e.stopPropagation();
					}}
					px={3}
				/>

				<Stack gap="xxs" flex={1}>
					<Group wrap="nowrap" gap="md" pos="relative">
						<Breadcrumbs separator="•" className={classes.breadcrumb}>
							<Text fz="sm" className={classes.text}>
								{sourceTitle}
							</Text>

							<Text fz="sm" className={classes.text}>
								{dayjs(highlight.createdAt).isSame(new Date(), 'year')
									? dayjs(highlight.createdAt).format('MMM D')
									: dayjs(highlight.createdAt).format('MMMM D, YYYY')}
							</Text>
						</Breadcrumbs>

						{hovered && !isBelowLgScreen && (
							<Group gap="xxxs" pos="absolute" right={0} visibleFrom="lg">
								<ItemsOptions size="sm" items={[highlight]} mode="highlights" />
							</Group>
						)}

						{(!hovered || isBelowLgScreen) && (
							<Box top={0} pos="absolute" right={0}>
								<IconQuoteFilled size={36} color="var(--mantine-color-dimmed)" />
							</Box>
						)}
					</Group>

					<Text lineClamp={20} fz="md" maw="90%">
						{highlight?.segments
							?.slice()
							.reverse()
							.map((segment, index) => (
								<span key={index}>{segment.text}</span>
							))}
					</Text>
				</Stack>
			</Group>
		</Stack>
	);
};
