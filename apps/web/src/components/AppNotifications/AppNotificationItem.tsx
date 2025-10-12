import { Text, Group, Badge, Tooltip, Anchor } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export type NotificationType = 'UPDATE' | 'ALERT' | 'NEWS' | 'SURVEY';

type AppNotificationItem = {
	id: number;
	type: NotificationType;
	text: string;
	badge?: string;
	date?: string;
	link?: string;
};

export const AppNotificationItem = ({ item }: { item: AppNotificationItem }) => {
	let itemColor;
	let badgeText;
	let badgeVariant = 'dot';
	let buttonText = 'Learn more';

	switch (item.type) {
		case 'UPDATE':
			badgeText = item.badge || 'UPDATE';
			buttonText = "See what's new";
			itemColor = 'primary';
			break;
		case 'ALERT':
			badgeText = 'IMPORTANT';
			badgeVariant = 'light';
			buttonText = 'View details';
			itemColor = 'red';
			break;
		case 'NEWS':
			break;
		case 'SURVEY':
			buttonText = 'Send feedback';
			break;
	}

	const anchorProps = item.link
		? { href: item.link, c: itemColor || 'primary', target: '_blank' }
		: {};

	const timeAgo = item.date ? dayjs(item.date).fromNow() : '';
	return (
		<Group key={item.id} gap="xxs" align="center" wrap="nowrap">
			{badgeText && (
				<Badge size="xs" radius="sm" color={`${itemColor}.6`} variant={badgeVariant}>
					{badgeText}
				</Badge>
			)}

			<Tooltip
				label={
					<>
						<Text size="xs" mb={4}>
							{item.text}
						</Text>
						{timeAgo && (
							<Text
								size="xs"
								c={item.type === 'ALERT' ? 'red.2' : 'dimmed'}
								fs="italic"
							>
								{timeAgo}
							</Text>
						)}
					</>
				}
				position="bottom"
				withArrow
				multiline
				maw={320}
				color={item.type === 'ALERT' ? 'red' : undefined}
				openDelay={300}
			>
				<Text
					size="xs"
					flex={1}
					lineClamp={1}
					c={item.type === 'ALERT' ? 'red' : 'dimmed'}
					fw={item.type === 'ALERT' ? 700 : undefined}
				>
					{item.text}
				</Text>
			</Tooltip>

			{item.link && (
				<Anchor {...anchorProps} fz="xs" ml={4}>
					{buttonText}
				</Anchor>
			)}
		</Group>
	);
};
