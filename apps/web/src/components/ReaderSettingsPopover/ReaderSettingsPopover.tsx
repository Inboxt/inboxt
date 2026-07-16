import { ActionIcon, Box, Drawer, MantineRadius, Popover, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { forwardRef, ReactNode, MouseEvent } from 'react';

import { useScreenQuery } from '~hooks/useScreenQuery';

import classes from '../MenuDrawer/MenuDrawer.module.css';

type ReaderSettingsOptionProps = {
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
	label: string;
	icon: ReactNode;
	disabled?: boolean;
	radius?: MantineRadius;
	size?: string | number;
};

const ReaderSettingsOption = forwardRef<HTMLButtonElement, ReaderSettingsOptionProps>(
	({ onClick, label, icon, disabled, radius, size = 'lg' }, ref) => {
		return (
			<Tooltip label={label} position="right" offset={16} disabled={disabled}>
				<ActionIcon
					variant="subtle"
					color="text"
					onClick={onClick}
					size={size}
					ref={ref}
					disabled={disabled}
					radius={radius}
				>
					{icon}
				</ActionIcon>
			</Tooltip>
		);
	},
);

interface ReaderSettingsPopoverProps extends ReaderSettingsOptionProps {
	children?: ReactNode;
}

export const ReaderSettingsPopover = ({
	children,
	onClick,
	label,
	icon,
	disabled,
	radius,
	size,
}: ReaderSettingsPopoverProps) => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

	if (onClick) {
		return (
			<ReaderSettingsOption
				onClick={onClick}
				icon={icon}
				label={label}
				disabled={disabled}
				radius={radius}
				size={size}
			/>
		);
	}

	if (isAboveXsScreen) {
		return (
			<Popover
				width={440}
				position="right-start"
				disabled={!children || disabled}
				offset={16}
				shadow="lg"
			>
				<Popover.Target>
					<ReaderSettingsOption
						icon={icon}
						label={label}
						disabled={disabled}
						radius={radius}
						size={size}
					/>
				</Popover.Target>
				<Popover.Dropdown>{children}</Popover.Dropdown>
			</Popover>
		);
	}

	return (
		<>
			<ReaderSettingsOption
				icon={icon}
				label={label}
				onClick={openDrawer}
				disabled={disabled}
				radius={radius}
				size={size}
			/>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				position="bottom"
				classNames={{
					header: classes.drawerHeader,
				}}
				size={label === 'Theme' ? 210 : 480}
				overlayProps={{
					opacity: 0.6,
				}}
				closeButtonProps={{
					icon: <IconX size={24} color="var(--mantine-color-text)" />,
				}}
				title={<Title order={4}>{label}</Title>}
			>
				<Box pt="xxs">{children}</Box>
			</Drawer>
		</>
	);
};
