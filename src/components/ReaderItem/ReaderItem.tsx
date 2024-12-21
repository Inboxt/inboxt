import {
	ActionIcon,
	Badge,
	Box,
	Checkbox,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import dayjs from 'dayjs';
import {
	IconArchive,
	IconTag,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';
import { useLongPress } from '../../hooks/useLongPress.tsx';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';
import { modals } from '@modals/modals.ts';

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
			style={{
				borderWidth: 0,
				borderStyle: 'solid',
				borderColor: 'var(--mantine-color-gray-4)',
				borderBottomWidth: 1,
				cursor: 'pointer',
			}}
			ref={ref}
			{...longPressHandlers}
		>
			<Group wrap="nowrap" maw="100%">
				<Checkbox
					checked={isSelected}
					variant="outline"
					color="dark"
					styles={{
						input: {
							borderColor: 'var(--mantine-color-dark-9)',
						},
					}} // TODO: Border color should be applied only when not selected
					onChange={() => toggleItemSelection(id)}
				/>

				<Stack gap={0} style={{ flex: 1 }}>
					<Group
						wrap="nowrap"
						gap="md"
						justify="space-between"
						h={28}
						style={{ position: 'relative' }}
					>
						<Text fw="700" lineClamp={1} maw="70%">
							{title}
						</Text>

						{!hovered || !isLargeScreen ? (
							<Text fz="sm" c="gray.7">
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
								<Tooltip
									label="Edit labels"
									openDelay={600}
									withArrow
									onClick={modals.openLabelsSelectionModal}
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										c="text"
									>
										<IconTag size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip
									label="Move to archive"
									openDelay={600}
									withArrow
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										c="text"
									>
										<IconArchive size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip
									label="Move to trash"
									openDelay={600}
									withArrow
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										c="text"
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip
									label="Open original"
									openDelay={600}
									withArrow
								>
									<ActionIcon
										variant="subtle"
										color="gray"
										c="text"
									>
										<IconWorld size={16} />
									</ActionIcon>
								</Tooltip>
							</Group>
						)}
					</Group>

					<Text lineClamp={1} fz="sm" c="gray.7" h={28}>
						{description ? description : author}
					</Text>

					<Group wrap="nowrap" gap={4} mt={0} maw="60%">
						{labels?.map(({ id, label, color }) => (
							<Badge
								size="xs"
								radius="sm"
								//style={{ display: 'flex' }}
								key={id}
								color={color}
							>
								{label}
							</Badge>
						))}
					</Group>
				</Stack>
			</Group>
		</Box>
	);
};
