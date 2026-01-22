import {
	Text,
	Group,
	Stack,
	ActionIcon,
	Button,
	Collapse,
	Skeleton,
	Divider,
	ScrollArea,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';

import { AppNotificationItem, AppNotificationItemData } from './AppNotificationItem';
import classes from './AppNotifications.module.css';

type NotificationWithId = AppNotificationItemData & { id: number };

type AppNotificationsProps = {
	maxHeight?: number;
};

export const AppNotifications = ({ maxHeight }: AppNotificationsProps) => {
	const [notificationList, setNotificationList] = useState<NotificationWithId[]>([]);
	const [expanded, setExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadNotifications = async () => {
			try {
				setIsLoading(true);

				const res = await fetch('/api/notifications');

				if (res.ok) {
					const data = (await res.json()) as AppNotificationItemData[];
					const withIds: NotificationWithId[] = (data || []).map((item, index) => ({
						...item,
						id: index + 1,
					}));

					if (isMounted) {
						setNotificationList(withIds);
					}
				}
			} catch {
				// Silently fail
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
			<Stack gap="xs" my="sm">
				<Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
					Updates
				</Text>
				<Skeleton height={40} radius="sm" width="100%" />
			</Stack>
		);
	}

	return (
		<Stack my="sm" gap="xs" mih={48} mah={maxHeight}>
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

			{notificationList.length > 0 && latestNotification ? (
				<ScrollArea.Autosize type="auto" offsetScrollbars>
					<Stack
						gap={expanded ? 'md' : 4}
						className={classes.notificationsList}
						mih={0}
						pr="xxs"
					>
						<AppNotificationItem item={latestNotification} />

						{hasMore && expanded && <Divider />}

						<Collapse in={expanded}>
							<Stack gap={0}>
								{remainingNotifications.map((item, index) => (
									<Fragment key={item.id}>
										<AppNotificationItem item={item} />

										{index !== remainingNotifications.length - 1 && (
											<Divider my="md" />
										)}
									</Fragment>
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
				</ScrollArea.Autosize>
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
