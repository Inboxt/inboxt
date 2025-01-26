import { ActionIcon, Box, Drawer, Popover, Tooltip } from '@mantine/core';
import { forwardRef, ReactNode } from 'react';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import classes from '../MenuDrawer/MenuDrawer.module.css';
import { IconX } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

type ReaderSettingsOptionProps = {
	onClick?: () => void;
	label: string;
	icon: ReactNode;
};

const ReaderSettingsOption = forwardRef<
	HTMLButtonElement,
	ReaderSettingsOptionProps
>(({ onClick, label, icon }, ref) => {
	return (
		<Tooltip label={label} position="right" offset={16}>
			<Box>
				<ActionIcon
					variant="subtle"
					color="text"
					onClick={onClick}
					size="lg"
					ref={ref}
				>
					{icon}
				</ActionIcon>
			</Box>
		</Tooltip>
	);
});

interface ReaderSettingsPopoverProps extends ReaderSettingsOptionProps {
	children?: ReactNode;
}

export const ReaderSettingsPopover = ({
	children,
	onClick,
	label,
	icon,
}: ReaderSettingsPopoverProps) => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
		useDisclosure(false);

	if (onClick) {
		return (
			<ReaderSettingsOption onClick={onClick} icon={icon} label={label} />
		);
	}

	if (isAboveXsScreen) {
		return (
			<Popover
				width={440}
				position="right-start"
				disabled={!children}
				offset={16}
				shadow="lg"
			>
				<Popover.Target>
					<ReaderSettingsOption icon={icon} label={label} />
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
			/>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				position="bottom"
				classNames={{
					header: classes.drawerHeader,
				}}
				size={label === 'Theme' ? 250 : 520}
				overlayProps={{
					opacity: 0.6,
				}}
				closeButtonProps={{
					icon: <IconX size={24} color="var(--mantine-color-text)" />,
				}}
			>
				{children}
			</Drawer>
		</>
	);
};
