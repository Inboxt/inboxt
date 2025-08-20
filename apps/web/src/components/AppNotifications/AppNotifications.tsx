import { Text, Group, Stack, ActionIcon, Button, Collapse, Skeleton } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';

import { AppNotificationItem } from './AppNotificationItem';
import classes from './AppNotifications.module.css';

// todo: get it from the backend
const updates = [
	{
		id: 1,
		type: 'UPDATE',
		badge: 'v1.2.0',
		date: 'August 20, 2025',
		text: 'Dark mode available',
		link: '/changelog',
	},
	{
		id: 2,
		type: 'ALERT',
		text: 'API service degradation affecting article syncing',
		link: '/breaking-change',
		date: 'August 18, 2025',
	},
	{
		id: 3,
		type: 'NEWS',
		text: 'iOS app coming next month',
		link: '/roadmap',
	},
	{
		id: 4,
		type: 'SURVEY',
		text: 'Help us improve: rate new article parsing',
		link: '/feedback',
	},
	{
		id: 5,
		type: 'UPDATE',
		badge: 'v1.1.0',
		date: 'July 15, 2025',
		text: 'New label management features',
		link: '/changelog',
	},
];

export const AppNotifications = () => {
	const [notificationList, setNotificationList] = useState(updates);
	const [expanded, setExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const latestNotification = notificationList[0];
	const remainingNotifications = notificationList.slice(1);
	const hasMore = notificationList.length > 1;

	if (isLoading) {
		return (
			<Stack my="sm" gap="xxxs">
				<Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
					Updates
				</Text>

				<Stack gap="xs">
					<Skeleton height={18} radius="sm" width="100%" animate={true} />
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack my="sm" gap="xs" mih={48} mah={300}>
			<Group
				gap="xxxs"
				align="center"
				onClick={() => hasMore && setExpanded((expanded) => !expanded)}
			>
				<Text
					fz="xs"
					fw={600}
					c="dimmed"
					tt="uppercase"
					lts={0.5}
					className={classes.notificationsTitle}
				>
					{hasMore ? `Updates (${notificationList.length})` : 'Latest Update'}
				</Text>

				{hasMore && (
					<ActionIcon
						size="xs"
						onClick={(e) => {
							e.stopPropagation();
							setExpanded((expanded) => !expanded);
						}}
						variant="subtle"
						title={expanded ? 'Show less' : 'Show more'}
					>
						{expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
					</ActionIcon>
				)}
			</Group>

			{notificationList.length > 0 ? (
				<Stack
					gap={expanded ? 'xs' : 4}
					className={classes.notificationsList}
					mih={0}
					pr="xxs"
				>
					<AppNotificationItem item={latestNotification} />

					<Collapse in={expanded}>
						<Stack gap="xs">
							{remainingNotifications.map((item) => (
								<AppNotificationItem item={item} key={item.id} />
							))}
						</Stack>
					</Collapse>

					{hasMore && !expanded && (
						<Button
							variant="subtle"
							color="gray"
							size="compact-xs"
							onClick={() => setExpanded(true)}
							rightSection={<IconChevronDown size={12} />}
							fw={400}
						>
							Show {notificationList.length - 1} more
						</Button>
					)}
				</Stack>
			) : (
				<Group gap="xxxs" align="center" w="100%">
					<Text size="xs" c="dimmed">
						We'll notify you here about updates, important news, and other information.
					</Text>
				</Group>
			)}
		</Stack>
	);
};
