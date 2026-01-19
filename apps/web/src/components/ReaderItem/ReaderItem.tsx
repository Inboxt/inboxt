import { Badge, Box, Breadcrumbs, Group, Stack, Text, Center, darken } from '@mantine/core';
import { useHover, useLocalStorage, useLongPress } from '@mantine/hooks';
import { IconPhotoOff } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { SavedItem } from '~lib/graphql';
import { Route } from '~routes/_auth.index';

import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';

import classes from './ReaderItem.module.css';

type ReaderItemProps = {
	item: SavedItem;
};

export const ReaderItem = ({ item }: ReaderItemProps) => {
	const { hovered, ref } = useHover();
	const { selectedItems, toggleItemSelection, isSelected } = useContentSelection();
	const isBelowLgScreen = useScreenQuery('lg', 'below');
	const navigate = useNavigate({ from: Route.fullPath });

	const [display] = useLocalStorage({
		key: 'display',
		defaultValue: 'list',
		serialize: (value) => value || '',
	});

	const selected = isSelected(item.id);
	const handleLongPress = () => {
		toggleItemSelection(item);
	};

	const longPressHandlers = useLongPress(handleLongPress, { threshold: 800 });

	return (
		<Box
			p="md"
			className={classes.item}
			ref={ref}
			onClick={() => {
				if (selectedItems.length > 0) {
					toggleItemSelection(item);

					return;
				}
				void navigate({ to: `/r/${item.id}` });
			}}
			{...longPressHandlers}
		>
			<Group wrap="nowrap" maw="100%">
				{display === 'gallery' ? (
					<Box pos="relative">
						<Box className={classes.leadImageWrapper}>
							{item.leadImage ? (
								<img src={item.leadImage} alt="" className={classes.leadImage} />
							) : (
								<Center className={classes.leadImage}>
									<IconPhotoOff size={36} color="var(--mantine-color-dimmed)" />
								</Center>
							)}
						</Box>

						<Box className={classes.checkboxWrapper}>
							<ReaderCheckbox
								checked={selected}
								onChange={() => toggleItemSelection(item)}
								onClick={(e) => {
									e.stopPropagation();
								}}
								px={3}
							/>
						</Box>
					</Box>
				) : (
					<ReaderCheckbox
						checked={selected}
						onChange={() => toggleItemSelection(item)}
						onClick={(e) => {
							e.stopPropagation();
						}}
						px={3}
					/>
				)}

				<Stack gap="xs" flex={1}>
					<Breadcrumbs separator="•" mb="-xxs" style={{ flexWrap: 'nowrap' }}>
						<Text fz="sm" className={classes.text}>
							{dayjs(item.createdAt).isSame(new Date(), 'year')
								? dayjs(item.createdAt).format('MMM D')
								: dayjs(item.createdAt).format('MMMM D, YYYY')}
						</Text>

						<Text
							fz="sm"
							className={classes.text}
						>{`${Math.ceil(item.wordCount / 240)} min read`}</Text>
					</Breadcrumbs>

					<Group wrap="nowrap" gap="md" justify="space-between" pos="relative">
						<Text fw="700" lineClamp={1} fz="lg" maw={hovered ? '75%' : 'unset'}>
							{item.title}
						</Text>

						{hovered && !isBelowLgScreen && (
							<Group gap="xxxs" visibleFrom="lg" right={0} pos="absolute">
								<ItemsOptions size="sm" items={[item]} mode="single" />
							</Group>
						)}
					</Group>

					<Text lineClamp={2} mt="-xxxs" fz="md" className={classes.text}>
						{item.description ? item.description : item.author}
					</Text>

					{(item.labels?.length || item.sourceDomain) && (
						<Group
							align="center"
							justify={item.labels?.length ? 'space-between' : 'flex-start'}
							wrap="nowrap"
						>
							{item.labels?.length && (
								<Group wrap="nowrap" gap="xxxs">
									{item.labels.map(({ id, name, color }) => (
										<Badge
											size="xs"
											radius="sm"
											key={id}
											color={color}
											c={darken(color, 0.7)}
										>
											{name}
										</Badge>
									))}
								</Group>
							)}

							{item.sourceDomain && (
								<Text fz="xs" c="dimmed">
									{item.sourceDomain}
								</Text>
							)}
						</Group>
					)}
				</Stack>
			</Group>
		</Box>
	);
};
