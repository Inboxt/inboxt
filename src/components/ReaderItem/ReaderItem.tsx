import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import dayjs from 'dayjs';

import classes from './ReaderItem.module.css';

import { useLongPress } from '../../hooks/useLongPress.tsx';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';
import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';

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
	const isLargeScreen = useLargeScreen();

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
			{...longPressHandlers}
		>
			<Group wrap="nowrap" maw="100%">
				<ReaderCheckbox
					checked={isSelected}
					onChange={() => toggleItemSelection(id)}
				/>

				<Stack gap={0} flex={1}>
					<Group
						wrap="nowrap"
						gap="md"
						justify="space-between"
						pos="relative"
					>
						<Text fw="700" lineClamp={1} maw="70%">
							{title}
						</Text>

						{!hovered || !isLargeScreen ? (
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
