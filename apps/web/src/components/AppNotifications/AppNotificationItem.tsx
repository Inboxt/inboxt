import { Text, Group, Badge, Anchor, Stack } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export type NotificationType = 'UPDATE' | 'INCIDENT' | 'INCIDENT_RESOLVED';
export type AppNotificationItemData = {
	id: number;
	type: NotificationType;
	text: string;
	badge?: string;
	date?: string;
	link?: string;
};

const NOTIFICATION_CONFIG = {
	UPDATE: {
		color: 'primary',
		badgeVariant: 'dot' as const,
		badgeText: null,
		linkText: "See what's new",
		textColor: 'dimmed' as const,
	},
	INCIDENT: {
		color: 'red',
		badgeVariant: 'light' as const,
		badgeText: 'Incident',
		textColor: 'red' as const,
	},
	INCIDENT_RESOLVED: {
		color: 'green',
		badgeVariant: 'light' as const,
		badgeText: 'Resolved',
		textColor: 'dimmed' as const,
	},
} as const;

export const AppNotificationItem = ({ item }: { item: AppNotificationItemData }) => {
	const config = NOTIFICATION_CONFIG[item.type];
	const badgeText = item.type === 'UPDATE' ? item.badge : config.badgeText;
	const timeAgo = item.date ? dayjs(item.date).fromNow() : '';

	return (
		<Stack gap="xxs">
			<Group gap="xxs" align="center">
				<Badge
					size="xs"
					radius="sm"
					color={`${config.color}.6`}
					variant={config.badgeVariant}
				>
					{badgeText}
				</Badge>
			</Group>

			<Stack gap={2} align="flex-start">
				<Text
					size="xs"
					lh={1.4}
					c={config.textColor}
					td={item.type === 'INCIDENT_RESOLVED' ? 'line-through' : 'none'}
				>
					{item.text}
				</Text>

				{item.type !== 'UPDATE' && timeAgo && (
					<Text size="xxs" c="dimmed">
						{timeAgo}
					</Text>
				)}

				{item.link && 'linkText' in config && (
					<Anchor href={item.link} size="xs" c={config.color} target="_blank" fw={500}>
						<Group gap={4} wrap="nowrap" align="center">
							{config.linkText}
							<IconArrowRight size={12} />
						</Group>
					</Anchor>
				)}
			</Stack>
		</Stack>
	);
};
