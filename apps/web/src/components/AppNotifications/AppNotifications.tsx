import { Text, Group, Stack, ActionIcon, Button, Collapse, Skeleton } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { AppNotificationItem } from './AppNotificationItem';
import classes from './AppNotifications.module.css';

type RemoteNotification = {
	type: 'UPDATE' | 'ALERT' | 'NEWS' | 'SURVEY';
	badge?: string;
	date?: string;
	text: string;
	link?: string;
};

type NotificationWithId = RemoteNotification & { id: number };

export const AppNotifications = () => {
	const [notificationList, setNotificationList] = useState<NotificationWithId[]>([]);
	const [expanded, setExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadNotifications = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const res = await fetch(`${process.env.API_URL}/notifications`, {
					cache: 'no-store',
				});
				if (!res.ok) {
					throw new Error(`Failed to load notifications (status ${res.status})`);
				}

				const data: RemoteNotification[] = await res.json();

				// Preserve the order from JSON, add synthetic IDs for React keys
				const withIds: NotificationWithId[] = (data || []).map((item, index) => ({
					...item,
					id: index + 1,
				}));

				if (isMounted) {
					setNotificationList(withIds);
				}
			} catch (err) {
				if (isMounted) {
					setError('Unable to load updates right now.');
					setNotificationList([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadNotifications();

		return () => {
			isMounted = false;
		};
	}, []);

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

	if (error) {
		return (
			<Stack my="sm" gap="xxxs">
				<Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
					Updates
				</Text>
				<Text size="xs" c="red">
					{error}
				</Text>
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
