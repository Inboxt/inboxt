import { useQuery } from '@apollo/client/react';
import { Box, Card, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import {
	IconBook,
	IconCalendar,
	IconClock,
	IconHistory,
	IconInbox,
	IconProps,
	IconTrendingUp,
} from '@tabler/icons-react';
import React from 'react';

import { GET_USER_STATS } from '~lib/graphql';

const StatCard = ({
	label,
	value,
	icon: Icon,
	description,
}: {
	label: string;
	value: string | number;
	icon: React.ComponentType<IconProps>;
	description?: string;
}) => (
	<Card p="md">
		<Group justify="space-between" wrap="nowrap" align="flex-start">
			<Text size="xs" c="dimmed" fw={700} tt="uppercase">
				{label}
			</Text>

			<Icon
				size={20}
				stroke={1.5}
				color="var(--mantine-color-dimmed)"
				style={{ flexShrink: 0 }}
			/>
		</Group>

		<Group align="flex-end" gap="xs" mt="md">
			<Text size="xl" fw={700}>
				{value}
			</Text>
		</Group>

		{description && (
			<Text size="xs" c="dimmed" mt={7}>
				{description}
			</Text>
		)}
	</Card>
);

export const StatsModal = ({ id: _id, context: _context }: ContextModalProps) => {
	const { data, loading } = useQuery(GET_USER_STATS);

	if (loading) {
		return (
			<Box p="xl" style={{ display: 'flex', justifyContent: 'center' }}>
				<Loader />
			</Box>
		);
	}

	const stats = data?.me?.stats;

	if (!stats) {
		return <Text>Failed to load stats.</Text>;
	}

	return (
		<Stack gap="lg" p="md">
			<SimpleGrid cols={{ base: 1, sm: 3 }}>
				<StatCard
					label="All time"
					value={stats.itemsReadCountAllTime}
					icon={IconHistory}
					description="Total items read"
				/>

				<StatCard
					label="This Week"
					value={stats.itemsReadCountWeek}
					icon={IconCalendar}
					description="Items read this week"
				/>

				<StatCard
					label="This Month"
					value={stats.itemsReadCountMonth}
					icon={IconCalendar}
					description="Items read this month"
				/>
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<StatCard
					label="Time Read"
					value={`~${Math.floor(stats.estimatedReadingTimeCompleted / 60)}h ${Math.round(
						stats.estimatedReadingTimeCompleted % 60,
					)}m`}
					icon={IconClock}
					description={`${stats.wordsReadCount.toLocaleString()} words read`}
				/>

				<StatCard
					label="Unread vs Read"
					value={`${stats.unreadCount} / ${stats.readCount}`}
					icon={IconInbox}
					description="Current backlog vs total read"
				/>
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<StatCard
					label="Avg Article Length"
					value={`${Math.round(stats.averageArticleLength)} words`}
					icon={IconBook}
					description={`~${Math.round(stats.averageArticleLength / 240)} min per article`}
				/>

				<StatCard
					label="Avg Time to Finish"
					value={
						stats.averageTimeToFinish
							? `${stats.averageTimeToFinish.toFixed(1)} days`
							: 'N/A'
					}
					icon={IconTrendingUp}
					description="Average time from saving to reading"
				/>
			</SimpleGrid>

			<Text size="xs" c="dimmed" ta="center">
				Stats reflect items automatically completed in the reader or manually marked as
				read. Moving items directly to archive or trash does not count toward reading stats.
			</Text>
		</Stack>
	);
};
