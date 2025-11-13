import { useMutation } from '@apollo/client';
import { ActionIcon, Button, Group, Stack, Tooltip } from '@mantine/core';
import { IconCopy, IconTrash } from '@tabler/icons-react';

import { ConfirmWithAlert } from '~components/ConfirmWithAlert/ConfirmWithAlert.tsx';
import { DELETE_INBOUND_EMAIL_ADDRESS, INBOUND_EMAIL_ADDRESSES } from '~lib/graphql';
import { InboundEmailAddress } from '~lib/graphql/generated/graphql';
import { modals } from '~modals/modals';

type EmailActionsProps = {
	email: InboundEmailAddress;
};

export const EmailActions = ({ email }: EmailActionsProps) => {
	const [deleteInboundEmailAddress, { loading: deleting }] = useMutation(
		DELETE_INBOUND_EMAIL_ADDRESS,
	);

	const handleDelete = async (emailId: string) => {
		await deleteInboundEmailAddress({
			variables: { data: { id: emailId } },
			refetchQueries: [INBOUND_EMAIL_ADDRESSES],
		});
	};

	const handleCopy = async (email: string) => {
		await navigator.clipboard.writeText(email);
	};

	const openDeleteConfirmModal = () => {
		modals.openConfirmModal({
			centered: true,
			title: 'Delete email address?',
			size: 640,
			children: (
				<ConfirmWithAlert
					lines={[
						'This email address will be permanently disabled and cannot be used again with the app.',
						'All future emails sent to this address will be ignored, and your existing content will remain untouched.',
						'Are you sure you want to proceed?',
					]}
				/>
			),
			labels: {
				confirm: 'Delete email',
				cancel: 'Cancel',
			},
			confirmProps: { color: 'red' },
			onConfirm: () => handleDelete(email.id),
		});
	};

	return (
		<>
			<Group miw={128} justify="center" visibleFrom="xs">
				<Tooltip label="Copy email">
					<ActionIcon
						variant="light"
						size="lg"
						onClick={() => void handleCopy(email.fullAddress)}
					>
						<IconCopy size={18} />
					</ActionIcon>
				</Tooltip>

				<Tooltip label="Delete email">
					<ActionIcon
						color="red"
						variant="light"
						size="lg"
						onClick={openDeleteConfirmModal}
						loading={deleting}
					>
						<IconTrash size={18} />
					</ActionIcon>
				</Tooltip>
			</Group>

			<Stack hiddenFrom="xs" mt="xs" gap="xs">
				<Button
					variant="light"
					leftSection={<IconCopy size={18} />}
					onClick={() => void handleCopy(email.fullAddress)}
					fullWidth
				>
					Copy Email
				</Button>

				<Button
					color="red"
					variant="light"
					leftSection={<IconTrash size={18} />}
					onClick={openDeleteConfirmModal}
					loading={deleting}
					fullWidth
				>
					Delete Email
				</Button>
			</Stack>
		</>
	);
};
