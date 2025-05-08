import {
	ActionIcon,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
	Tooltip,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconCopy, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export const NewslettersModal = ({ id, context }: ContextModalProps) => {
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
		<Stack>
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

			<Group justify="flex-end">
				<Button
					variant="light"
					color="text"
					onClick={() => context.closeModal(id)}
				>
					Close
				</Button>
			</Group>
		</Stack>
	);
};
