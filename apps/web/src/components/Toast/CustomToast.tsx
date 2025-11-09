import { Paper, Group, Text, CloseButton, Button, ThemeIcon, Loader, Stack } from '@mantine/core';
import { IconCheck, IconInfoCircle, IconAlertTriangle, IconX } from '@tabler/icons-react';
import { toast as sonnerToast } from 'sonner';

import classes from './CustomToast.module.css';
import { ToastProps } from './type.ts';

export const CustomToast = (props: ToastProps) => {
	const { id, title, description, action, variant = 'info' } = props;

	const icon = (() => {
		switch (variant) {
			case 'success':
				return (
					<ThemeIcon color="green" variant="light" radius="xl" size="sm">
						<IconCheck size={16} />
					</ThemeIcon>
				);
			case 'error':
				return (
					<ThemeIcon color="red" variant="light" radius="xl">
						<IconX size={16} />
					</ThemeIcon>
				);
			case 'warning':
				return (
					<ThemeIcon color="yellow" variant="light" radius="xl">
						<IconAlertTriangle size={16} />
					</ThemeIcon>
				);
			case 'loading':
				return (
					<ThemeIcon color="blue" variant="light" radius="xl">
						<Loader size="xs" type="oval" />
					</ThemeIcon>
				);
			case 'info':
			default:
				return (
					<ThemeIcon color="blue" variant="light" radius="xl">
						<IconInfoCircle size={16} />
					</ThemeIcon>
				);
		}
	})();

	return (
		<Paper
			p="sm"
			radius={4}
			withBorder
			className={classes.container}
			miw={356}
			display="flex"
			mih={54}
		>
			<Group gap="xs" wrap="nowrap" align="center" justify="center" flex={1}>
				{icon}
				<Stack flex={1} gap={2}>
					{title && (
						<Text size="sm" fw={500} truncate="end">
							{title}
						</Text>
					)}

					{description && (
						<Text c="dimmed" size="sm" truncate="end">
							{description}
						</Text>
					)}
				</Stack>

				{action && variant !== 'loading' && (
					<Button
						size="compact-xs"
						px="md"
						variant="light"
						onClick={() => {
							action.onClick?.();
							sonnerToast.dismiss(id);
						}}
					>
						{action.label}
					</Button>
				)}

				{variant !== 'loading' && !action && (
					<CloseButton onClick={() => sonnerToast.dismiss(id)} />
				)}
			</Group>
		</Paper>
	);
};
