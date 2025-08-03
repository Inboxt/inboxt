import { useEffect } from 'react';
import { Alert, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { useMutation, useQuery } from '@apollo/client';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangleFilled } from '@tabler/icons-react';

import { modals } from '@modals/modals.ts';

import { Email, EmailCard } from './EmailCard.tsx';
import { CREATE_INBOUND_EMAIL_ADDRESS, INBOUND_EMAIL_ADDRESSES } from '../../lib/graphql.ts';
import { parseError } from '../../utils/parse-error.ts';

export const EmailsModal = ({ id, context }: ContextModalProps) => {
	const { data, loading } = useQuery(INBOUND_EMAIL_ADDRESSES, {
		fetchPolicy: 'cache-and-network',
	});

	const emails: Email[] = data?.inboundEmailAddresses || [];
	useEffect(() => {
		modals.update(id, { title: `Manage Email Addresses (${emails.length}/2)` });
	}, [emails.length]);

	const [createInboundEmailAddress, { loading: creating, error }] = useMutation(
		CREATE_INBOUND_EMAIL_ADDRESS,
	);

	const handleCreate = async () => {
		await createInboundEmailAddress({ refetchQueries: [INBOUND_EMAIL_ADDRESSES] });
	};

	return (
		<Stack gap="xl" className="overflow-container">
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
				{emails.length === 0 && (
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
			<Group justify="space-between">
				<Button variant="default" onClick={() => context.closeModal(id)}>
					Close
				</Button>

				<Button onClick={handleCreate} disabled={emails.length >= 2} loading={creating}>
					Create Email Address
				</Button>
			</Group>
		</Stack>
	);
};
