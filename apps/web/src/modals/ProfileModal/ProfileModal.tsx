import {
	Stack,
	TextInput,
	Button,
	Group,
	Progress,
	Text,
	Tooltip,
	ActionIcon,
	SegmentedControl,
	Title,
	Divider,
	useMantineColorScheme,
	useComputedColorScheme,
} from '@mantine/core';
import { useState } from 'react';
import {
	IconCopy,
	IconTrash,
	IconDatabase,
	IconHighlight,
} from '@tabler/icons-react';
import { ContextModalProps } from '@mantine/modals';

export const ProfileModal = ({ id, context }: ContextModalProps) => {
	const { setColorScheme, colorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme();

	const usedStorage = 3;
	const totalStorage = 10;
	const storagePercentage = (usedStorage / totalStorage) * 100;

	const [emails, setEmails] = useState<string[]>([]);
	const addEmail = () => {
		if (emails.length < 5) {
			setEmails([...emails, `new.email${emails.length + 1}@example.com`]);
		}
	};

	const deleteEmail = (index: number) => {
		setEmails(emails.filter((_, i) => i !== index));
	};

	const copyEmail = async (email: string) => {
		await navigator.clipboard.writeText(email);
		alert(`Copied: ${email}`);
	};

	return (
		<Stack gap="xl">
			<Stack gap="md">
				<TextInput label="Name" placeholder="Enter your name" />
				<TextInput
					label="Email address"
					placeholder="Enter your email address"
				/>
			</Stack>

			<Divider />

			<Stack gap="md">
				<Title order={5}>Theme</Title>
				<SegmentedControl
					fullWidth
					color={computedColorScheme === 'dark' ? undefined : 'dark'}
					value={colorScheme}
					onChange={setColorScheme}
					data={[
						{ label: 'System', value: 'auto' },
						{ label: 'Light', value: 'light' },
						{ label: 'Dark', value: 'dark' },
					]}
				/>
			</Stack>

			<Divider />

			<Stack gap="md">
				<Title order={5}>Storage Usage</Title>
				<Stack gap="xs">
					<Progress
						value={storagePercentage}
						size="sm"
						color="blue"
						radius="md"
					/>
					<Text size="xs" c="dimmed">
						{usedStorage}GB of {totalStorage}GB used
					</Text>
				</Stack>
			</Stack>

			<Divider />

			<Stack gap="md">
				<Title order={5}>
					Manage Newsletter Emails ({emails.length}/5)
				</Title>
				{emails.map((email, index) => (
					<Group key={index} align="center" gap="xs">
						<TextInput
							value={email}
							readOnly
							style={{ flexGrow: 1 }}
						/>
						<Tooltip label="Copy email">
							<ActionIcon
								variant="light"
								onClick={() => copyEmail(email)}
								size="lg"
							>
								<IconCopy size={18} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Delete email">
							<ActionIcon
								color="red"
								variant="light"
								onClick={() => deleteEmail(index)}
								size="lg"
							>
								<IconTrash size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				))}
				<Button
					onClick={addEmail}
					disabled={emails.length >= 5}
					variant="default"
				>
					Add New Email
				</Button>
				{emails.length >= 5 && (
					<Text size="xs" c="red">
						You can add up to 5 emails.
					</Text>
				)}
			</Stack>

			<Divider />

			<Stack gap="xs">
				<Title order={5}>Export Data</Title>

				<Text>
					You can request data export once per day. The export will be
					sent to your registered email address, and you should
					receive it within an hour. The download link will remain
					valid for 24 hours.
				</Text>

				<Group grow>
					<Button
						leftSection={<IconDatabase size={16} />}
						variant="default"
					>
						Export Full Account Data
					</Button>

					<Button
						leftSection={<IconHighlight size={16} />}
						variant="default"
					>
						Export Highlights
					</Button>
				</Group>
			</Stack>

			<Group justify="space-between">
				<Button variant="outline" color="red">
					Delete Account
				</Button>
				<Group>
					<Button
						variant="default"
						onClick={() => context.closeModal(id)}
					>
						Cancel
					</Button>
					<Button>Save</Button>
				</Group>
			</Group>
		</Stack>
	);
};
