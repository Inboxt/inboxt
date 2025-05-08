import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import dayjs from 'dayjs';

import classes from './ReaderItem.module.css';

import { useLongPress } from '../../hooks/useLongPress.tsx';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '../../routes/r.$id.tsx';

type ItemLabel = {
	id: number;
	label: string;
	color: string;
};

type ReaderItemProps = {
	id: number;
	title: string;
	receivedAt: string;
	author: string;
	description?: string;
	url?: string;
	labels?: ItemLabel[];
};

export const ReaderItem = ({
	id,
	title,
	receivedAt,
	author,
	description,
	labels,
}: ReaderItemProps) => {
	const { hovered, ref } = useHover();
	const { selectedItemIds, toggleItemSelection } = useReaderContext();
	const isBelowLgScreen = useScreenQuery('lg', 'below');
	const navigate = useNavigate({ from: Route.fullPath });

	const isSelected = selectedItemIds.includes(id);
	const handleLongPress = () => {
		toggleItemSelection(id);
	};

	const longPressHandlers = useLongPress(handleLongPress);

	return (
		<Box
			key={id}
			px="md"
			py="md"
			className={classes.item}
			ref={ref}
			onClick={() => {
				if (selectedItemIds.length > 0) {
					toggleItemSelection(id);

					return;
				}
				void navigate({ to: `/r/${id.toString()}`, search: {} });
			}}
			{...longPressHandlers}
		>
			<Group wrap="nowrap" maw="100%">
				<ReaderCheckbox
					checked={isSelected}
					onChange={() => toggleItemSelection(id)}
					onClick={(e) => {
						e.stopPropagation();
					}}
				/>

				<Stack gap={0} flex={1}>
					<Group wrap="nowrap" gap="md" justify="space-between" pos="relative">
						<Text fw="700" lineClamp={1} maw="70%">
							{title}
						</Text>

						{!hovered || isBelowLgScreen ? (
							<Text fz="sm" className={classes.text}>
								{dayjs(receivedAt).isSame(new Date(), 'year')
									? dayjs(receivedAt).format('MMM D')
									: dayjs(receivedAt).format('DD/MM/YYYY')}
							</Text>
						) : (
							<Group
								gap={4}
								style={{ position: 'absolute', right: 0 }}
								visibleFrom="lg"
							>
								<ItemsOptions size="sm" />
							</Group>
						)}
					</Group>

					<Text lineClamp={2} fz="sm" className={classes.text}>
						{description ? description : author}
					</Text>

					<Group wrap="nowrap" gap="xxxs" maw="60%" mt={6}>
						{labels?.map(({ id, label, color }) => (
							<Badge size="xs" radius="sm" key={id} color={color}>
								{label}
							</Badge>
						))}
					</Group>
				</Stack>
			</Group>
		</Box>
	);
};
