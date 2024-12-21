import {
	Box,
	Burger,
	Divider,
	Group,
	NavLink,
	Stack,
	Transition,
	Tooltip,
	Drawer,
} from '@mantine/core';
import {
	IconArchive,
	IconHighlight,
	IconHome,
	IconLabelImportantFilled,
	IconMail,
	IconTrash,
	IconX,
} from '@tabler/icons-react';

import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';

const BACKEND_LABELS = [
	{
		id: 1,
		name: 'Reddit',
		color: 'gray-6',
	},
	{
		id: 2,
		name: 'Work Stuff',
		color: 'red-6',
	},
	{
		id: 3,
		name: 'Electronics',
		color: 'blue-6',
	},
	{
		id: 4,
		name: 'Listen',
		color: 'pink-6',
	},
];

type NavbarProps = {
	opened: boolean;
	toggle: () => void;
};

export const Navbar = ({ opened, toggle }: NavbarProps) => {
	const isLargeScreen = useLargeScreen();

	const navLinks = (
		<Stack
			mt={isLargeScreen ? 'md' : 0}
			gap={0}
			c="dark.7"
			pr={opened ? 'md' : '0'}
		>
			<Tooltip label="Inbox" position="right" disabled={opened}>
				<NavLink
					label={
						<Transition
							mounted={opened}
							transition="fade"
							duration={300}
							timingFunction="ease"
						>
							{(styles) => <div style={styles}>Inbox</div>}
						</Transition>
					}
					leftSection={<IconHome size={21} />}
					variant="light"
					href="#required-for-focus"
					styles={{
						root: { height: 44 },
						label: { fontSize: 'var(--mantine-font-size-lg)' },
					}}
				/>
			</Tooltip>

			<Tooltip label="Newsletters" position="right" disabled={opened}>
				<NavLink
					label={
						<Transition
							mounted={opened}
							transition="fade"
							duration={300}
							timingFunction="ease"
						>
							{(styles) => <div style={styles}>Newsletters</div>}
						</Transition>
					}
					leftSection={<IconMail size={21} />}
					variant="light"
					href="#required-for-focus"
					styles={{
						root: { height: 44 },
						label: { fontSize: 'var(--mantine-font-size-lg)' },
					}}
				/>
			</Tooltip>

			<Tooltip label="Highlights" position="right" disabled={opened}>
				<NavLink
					label={
						<Transition
							mounted={opened}
							transition="fade"
							duration={300}
							timingFunction="ease"
						>
							{(styles) => <div style={styles}>Highlights</div>}
						</Transition>
					}
					leftSection={<IconHighlight size={21} />}
					variant="light"
					href="#required-for-focus"
					styles={{
						root: { height: 44 },
						label: { fontSize: 'var(--mantine-font-size-lg)' },
					}}
				/>
			</Tooltip>

			<Tooltip label="Archive" position="right" disabled={opened}>
				<NavLink
					label={
						<Transition
							mounted={opened}
							transition="fade"
							duration={300}
							timingFunction="ease"
						>
							{(styles) => <div style={styles}>Archive</div>}
						</Transition>
					}
					leftSection={<IconArchive size={21} />}
					variant="light"
					href="#required-for-focus"
					styles={{
						root: { height: 44 },
						label: { fontSize: 'var(--mantine-font-size-lg)' },
					}}
				/>
			</Tooltip>

			<Tooltip label="Trash" position="right" disabled={opened}>
				<NavLink
					label={
						<Transition
							mounted={opened}
							transition="fade"
							duration={300}
							timingFunction="ease"
						>
							{(styles) => <div style={styles}>Trash</div>}
						</Transition>
					}
					leftSection={<IconTrash size={21} />}
					variant="light"
					href="#required-for-focus"
					styles={{
						root: { height: 44 },
						label: { fontSize: 'var(--mantine-font-size-lg)' },
					}}
				/>
			</Tooltip>

			<Divider m="sm" label={opened ? 'Labels' : undefined} />
			{BACKEND_LABELS.map((label) => (
				<Tooltip
					key={label.id}
					label={label.name}
					position="right"
					disabled={opened}
				>
					<NavLink
						label={
							<Transition
								mounted={opened}
								transition="fade"
								duration={300}
								timingFunction="ease"
							>
								{(styles) => (
									<div style={styles}>{label.name}</div>
								)}
							</Transition>
						}
						leftSection={
							<IconLabelImportantFilled
								size={21}
								style={{
									color: `var(--mantine-color-${label.color})`,
								}}
							/>
						}
						variant="light"
						href="#required-for-focus"
						styles={{
							root: { height: 44 },
							label: { fontSize: 'var(--mantine-font-size-lg)' },
						}}
					/>
				</Tooltip>
			))}
		</Stack>
	);

	if (!isLargeScreen) {
		return (
			<Drawer
				opened={opened}
				onClose={toggle}
				title="Feeds"
				styles={{
					title: {
						fontSize: 'var(--mantine-font-size-xxl)',
						fontWeight: 700,
					},
				}}
				size="xs"
				closeButtonProps={{
					icon: <IconX size={34} color="black" />,
				}}
				overlayProps={{ opacity: 0.6 }}
			>
				{navLinks}
			</Drawer>
		);
	}

	return (
		<>
			<Box
				style={{
					width: opened ? 240 : 60,
					marginLeft: opened ? 70 : 250,
					transition: 'width 0.3s, margin 0.3s',
				}}
				pt="md"
			>
				<Group
					justify="flex-end"
					px="md"
					pr={opened ? 'md' : 21}
					visibleFrom="lg"
				>
					<Burger opened={opened} onClick={toggle} />
				</Group>

				{navLinks}
			</Box>
		</>
	);
};
