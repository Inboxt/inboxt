import { useMutation, useQuery } from '@apollo/client';
import {
	Alert,
	Button,
	Group,
	Card,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
	Tooltip,
	ActionIcon,
	CopyButton,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangleFilled, IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { CREATE_INBOUND_EMAIL_ADDRESS, INBOUND_EMAIL_ADDRESSES } from '~lib/graphql';
import { runtimeConfig } from '~lib/runtime-config';
import { modals } from '~modals/modals';
import { parseError } from '~utils/parse-error';

import { EmailCard } from './EmailCard';

export const EmailsModal = ({ id, context }: ContextModalProps) => {
	const { data, loading } = useQuery(INBOUND_EMAIL_ADDRESSES, {
		fetchPolicy: 'cache-and-network',
	});

	const emails = data?.inboundEmailAddresses || [];
	const webhookUrl = `${runtimeConfig.appUrl}/inbox/items/mail-webhook`;

	useEffect(() => {
		modals.update(id, {
			title: `Manage Email Addresses (${emails.length})`,
		});
	}, [emails.length, id]);

	const [createInboundEmailAddress, { loading: creating, error }] = useMutation(
		CREATE_INBOUND_EMAIL_ADDRESS,
	);

	const handleCreate = async () => {
		await createInboundEmailAddress({ refetchQueries: [INBOUND_EMAIL_ADDRESSES] });
	};

	return (
		<Stack gap="xl" flex={1}>
			<Alert color="gray">
				You can use these email addresses to receive newsletters and other messages directly
				within the app. When emails are sent to these addresses, we’ll do our best to
				process and save their content so you can easily access them in the app.
				<Text c="dimmed" size="xs" mt="xs">
					Please note: Sending attachments such as documents or PDFs aren’t supported yet,
					but we’re working on it.
				</Text>
			</Alert>

			<Skeleton visible={loading}>
				{webhookUrl && (
					<Card mb="xl">
						<Stack gap="xs">
							<Title order={5}>Webhook URL:</Title>
							<Group gap="xs" wrap="nowrap">
								<TextInput
									value={webhookUrl}
									readOnly
									size="sm"
									variant="unstyled"
									style={{ flex: 1 }}
								/>
								<CopyButton value={webhookUrl} timeout={2000}>
									{({ copied, copy }) => (
										<Tooltip label={copied ? 'Copied' : 'Copy URL'}>
											<ActionIcon
												color={copied ? 'teal' : undefined}
												variant="light"
												size="lg"
												onClick={copy}
											>
												{copied ? (
													<IconCheck size={18} />
												) : (
													<IconCopy size={18} />
												)}
											</ActionIcon>
										</Tooltip>
									)}
								</CopyButton>
							</Group>
							<Text size="xs" c="dimmed">
								Use this URL in your email provider's settings to forward emails to
								the app.
							</Text>
						</Stack>
					</Card>
				)}

				{emails.length === 0 && !loading && (
					<Text size="sm" c="dimmed">
						You haven't created any email addresses yet.
					</Text>
				)}

				<Stack gap="md">
					{emails.map((email) => (
						<EmailCard email={email} key={email.id} />
					))}
				</Stack>
			</Skeleton>

			{error && (
				<Alert
					icon={<IconAlertTriangleFilled />}
					color="red"
					variant="light"
					p="xs"
					style={{ whiteSpace: 'pre-line' }}
				>
					{parseError(error)?.message}
				</Alert>
			)}

			<ButtonContainer mt="auto">
				<Button variant="default" onClick={() => context.closeModal(id)}>
					Close
				</Button>

				<Button onClick={handleCreate} loading={creating}>
					Create Email Address
				</Button>
			</ButtonContainer>
		</Stack>
	);
};
