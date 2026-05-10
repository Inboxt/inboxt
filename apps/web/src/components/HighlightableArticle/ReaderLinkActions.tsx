import { Button, Divider, Drawer, Paper, Stack, Text, Title } from '@mantine/core';
import { IconExternalLink, IconLink, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';

import { useScreenQuery } from '~hooks/useScreenQuery';

import menuDrawerClasses from '../MenuDrawer/MenuDrawer.module.css';

type ReaderLinkActionsProps = {
	linkActions: {
		url: string;
		x: number;
		y: number;
	} | null;
	onClose: () => void;
	onSaveLink: () => void;
	onOpenLink: () => void;
	onCopyLink: () => void;
};

export const ReaderLinkActions = ({
	linkActions,
	onClose,
	onSaveLink,
	onOpenLink,
	onCopyLink,
}: ReaderLinkActionsProps) => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const linkActionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!linkActions || !isAboveXsScreen) {
			return;
		}

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (linkActionsRef.current?.contains(target)) {
				return;
			}

			onClose();
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [linkActions, onClose, isAboveXsScreen]);

	if (!linkActions) {
		return null;
	}

	const desktopPanelWidth = 280;
	const edgePadding = 12;
	const panelOffset = 12;
	const estimatedPanelHeight = 270;

	const desktopMinX = desktopPanelWidth / 2 + edgePadding;
	const desktopMaxX = window.innerWidth - desktopPanelWidth / 2 - edgePadding;
	const boundedDesktopX = Math.max(desktopMinX, Math.min(linkActions.x, desktopMaxX));
	const canOpenAbove = linkActions.y - estimatedPanelHeight - panelOffset > edgePadding;
	const desktopTop = canOpenAbove
		? Math.max(edgePadding, linkActions.y - panelOffset)
		: Math.min(window.innerHeight - edgePadding, linkActions.y + panelOffset);
	const desktopTransform = canOpenAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)';

	if (!isAboveXsScreen) {
		return (
			<Drawer
				opened
				onClose={onClose}
				position="bottom"
				size={238}
				title={<Title order={4}>Link Options</Title>}
				classNames={{
					header: menuDrawerClasses.drawerHeader,
				}}
				overlayProps={{ opacity: 0.6 }}
				closeButtonProps={{
					icon: <IconX size={24} color="var(--mantine-color-text)" />,
				}}
			>
				<Stack gap="xxxs" pb={0}>
					<Text size="xs" c="dimmed" mb="xs" lineClamp={2}>
						{linkActions.url}
					</Text>
					<Button
						leftSection={<IconPlus size={16} />}
						variant="filled"
						size="sm"
						justify="flex-start"
						onClick={onSaveLink}
					>
						Save to Inboxt
					</Button>
					<Button
						leftSection={<IconExternalLink size={16} />}
						variant="light"
						size="sm"
						justify="flex-start"
						onClick={onOpenLink}
					>
						Open link
					</Button>
					<Button
						leftSection={<IconLink size={16} />}
						variant="subtle"
						size="sm"
						justify="flex-start"
						onClick={onCopyLink}
					>
						Copy link
					</Button>
				</Stack>
			</Drawer>
		);
	}

	return (
		<Paper
			ref={linkActionsRef}
			withBorder
			shadow="md"
			radius="md"
			p="xs"
			style={{
				position: 'fixed',
				top: desktopTop,
				left: boundedDesktopX,
				transform: desktopTransform,
				zIndex: 450,
				width: desktopPanelWidth,
				maxWidth: 'calc(100vw - 24px)',
			}}
		>
			<Stack gap="xxs">
				<Title order={6}>Link options</Title>
				<Text size="sm" lineClamp={2} c="dimmed">
					{linkActions.url}
				</Text>
				<Divider color="var(--mantine-color-default-border)" />
				<Button
					leftSection={<IconPlus size={16} />}
					variant="filled"
					radius="xs"
					size="sm"
					justify="flex-start"
					onClick={onSaveLink}
				>
					Save to Inboxt
				</Button>
				<Button
					leftSection={<IconExternalLink size={16} />}
					variant="light"
					radius="xs"
					size="sm"
					justify="flex-start"
					onClick={onOpenLink}
				>
					Open link
				</Button>
				<Button
					leftSection={<IconLink size={16} />}
					variant="subtle"
					radius="xs"
					size="sm"
					justify="flex-start"
					onClick={onCopyLink}
				>
					Copy link
				</Button>
			</Stack>
		</Paper>
	);
};
