import { Badge, Box, Breadcrumbs, Group, Stack, Text, Center } from '@mantine/core';
import { useHover, useLocalStorage, useLongPress } from '@mantine/hooks';
import { IconPhotoOff } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { SavedItem } from '~lib/graphql/generated/graphql';
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

	const longPressHandlers = useLongPress(handleLongPress);

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
					<Box style={{ position: 'relative' }}>
						<Box
							style={{
								height: 90,
								width: 90,
								overflow: 'hidden',
							}}
						>
							{item.leadImage ? (
								<img
									src={item.leadImage}
									alt=""
									style={{
										height: '100%',
										width: '100%',
										objectFit: 'cover',
										backgroundColor:
											'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))',
										borderRadius: 4,
									}}
								/>
							) : (
								<Center
									style={{
										height: '100%',
										width: '100%',
										backgroundColor:
											'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))',
										borderRadius: 4,
									}}
								>
									<IconPhotoOff size={36} color="var(--mantine-color-dimmed)" />
								</Center>
							)}
						</Box>

						<Box
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: 0,
								right: 0,
								display: 'flex',
								alignItems: 'center',
							}}
						>
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

				<Stack gap={6} flex={1}>
					<Group wrap="nowrap" gap="md" justify="space-between" pos="relative">
						<Text fw="700" lineClamp={1} fz="lg" maw={hovered ? '75%' : 'unset'}>
							{item.title}
						</Text>

						{hovered && !isBelowLgScreen ? (
							<Group
								gap={4}
								style={{ position: 'absolute', right: 0 }}
								visibleFrom="lg"
							>
								<ItemsOptions size="sm" items={[item]} mode="single" />
							</Group>
						) : (
							<Breadcrumbs
								separator="•"
								separatorMargin={6}
								style={{ flexWrap: 'nowrap' }}
							>
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
						)}
					</Group>

					<Text lineClamp={2} fz="md" className={classes.text}>
						{item.description ? item.description : item.author}
					</Text>

					<Group
						align="center"
						mt={6}
						justify={item.labels?.length ? 'space-between' : 'flex-start'}
						wrap="nowrap"
					>
						{item.labels?.length && (
							<Group wrap="nowrap" gap="xxxs">
								{item.labels.map(({ id, name, color }) => (
									<Badge size="xs" radius="sm" key={id} color={color}>
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
				</Stack>
			</Group>
		</Box>
	);
};
