import { useMutation } from '@apollo/client';
import { ActionIcon, Button, CopyButton, Group, Stack, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconTrash } from '@tabler/icons-react';

import { ConfirmWithAlert } from '~components/ConfirmWithAlert';
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
				<CopyButton value={email.fullAddress} timeout={2000}>
					{({ copied, copy }) => (
						<Tooltip label={copied ? 'Copied' : 'Copy email'}>
							<ActionIcon
								color={copied ? 'teal' : undefined}
								variant="light"
								size="lg"
								onClick={copy}
							>
								{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
							</ActionIcon>
						</Tooltip>
					)}
				</CopyButton>

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
				<CopyButton value={email.fullAddress} timeout={2000}>
					{({ copied, copy }) => (
						<Button
							color={copied ? 'teal' : undefined}
							variant="light"
							leftSection={copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
							onClick={copy}
							fullWidth
						>
							{copied ? 'Copied' : 'Copy Email'}
						</Button>
					)}
				</CopyButton>

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
