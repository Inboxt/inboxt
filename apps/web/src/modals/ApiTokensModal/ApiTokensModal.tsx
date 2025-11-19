import { useQuery, useMutation } from '@apollo/client';
import {
	Alert,
	Button,
	Skeleton,
	Stack,
	Text,
	Group,
	ActionIcon,
	Card,
	Box,
	Breadcrumbs,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { ConfirmWithAlert } from '~components/ConfirmWithAlert';
import { toastSuccess } from '~components/Toast';
import { API_TOKENS, DELETE_API_TOKEN } from '~lib/graphql';
import { modals } from '~modals/modals';

export const ApiTokensModal = ({ id, context }: ContextModalProps) => {
	const { data, loading, refetch } = useQuery(API_TOKENS, {
		fetchPolicy: 'cache-and-network',
	});

	const [deleteApiToken, { loading: deleting }] = useMutation(DELETE_API_TOKEN);

	const tokens = data?.apiTokens || [];

	useEffect(() => {
		modals.update(id, {
			title: `API Tokens (${tokens.length})`,
		});
	}, [tokens.length, id]);

	const openCreateModal = () => {
		modals.openCreateApiTokenModal({
			onCreated: () => {
				void refetch();
			},
		});
	};

	const openDeleteConfirmModal = (tokenId: string) => {
		modals.openConfirmModal({
			centered: true,
			title: 'Delete this api token?',
			size: 640,
			children: (
				<ConfirmWithAlert
					lines={[
						'Any applications or scripts using this token will stop working immediately.',
						'This action cannot be undone.',
					]}
				/>
			),
			labels: {
				confirm: 'Delete API Token',
				cancel: 'Cancel',
			},
			confirmProps: { color: 'red' },
			onConfirm: () => handleDelete(tokenId),
		});
	};

	const handleDelete = async (tokenId: string) => {
		await deleteApiToken({
			variables: {
				data: {
					id: tokenId,
				},
			},
		});

		toastSuccess({
			title: 'API token deleted. Access via this token has been immediately revoked.',
		});

		await refetch();
	};

	return (
		<Stack gap="xl" justify="space-between" flex={1}>
			<Alert color="gray">
				API tokens allow you to develop plugins, extensions, and connect your account to
				other services. Treat these tokens like your password - anyone with a token can
				access your account.
				<Text c="dimmed" size="xs" mt="xs">
					Tokens can have an optional expiry date (they stop working automatically at the
					end of that day), and you can delete them at any time.
				</Text>
			</Alert>

			<Skeleton visible={loading}>
				{tokens.length === 0 && (
					<Text size="sm" c="dimmed">
						You haven't created any API tokens yet.
					</Text>
				)}

				{tokens.length > 0 && (
					<Box className="overflow-container" mah={300}>
						<Stack gap="sm">
							{tokens.map((token) => {
								const createdAt = dayjs(token.createdAt);
								const lastUsedAt = token.lastUsedAt
									? dayjs(token.lastUsedAt)
									: null;
								const expiresAt = token.expiresAt ? dayjs(token.expiresAt) : null;

								const isExpired = expiresAt ? expiresAt.isBefore(dayjs()) : false;

								return (
									<Card key={token.id}>
										<Group justify="space-between" align="flex-start">
											<Stack gap={6} flex={1}>
												<Text fw={500}>{token.name}</Text>

												<Breadcrumbs separator="•" separatorMargin={6}>
													<Text c="dimmed" size="xs">
														Created{' '}
														{createdAt.format('YYYY-MM-DD HH:mm')}
													</Text>

													{lastUsedAt && (
														<Text c="dimmed" size="xs">
															Last used{' '}
															{lastUsedAt.format('YYYY-MM-DD HH:mm')}
														</Text>
													)}

													{expiresAt && (
														<Text
															c={isExpired ? 'red' : 'dimmed'}
															size="xs"
														>
															{isExpired
																? `Expired on ${expiresAt.format('YYYY-MM-DD')}`
																: `Expires on ${expiresAt.format('YYYY-MM-DD')}`}
														</Text>
													)}
												</Breadcrumbs>
											</Stack>

											<ActionIcon
												variant="light"
												color="red"
												onClick={() => openDeleteConfirmModal(token.id)}
												aria-label="Delete token"
												loading={deleting}
											>
												<IconTrash size={16} />
											</ActionIcon>
										</Group>
									</Card>
								);
							})}
						</Stack>
					</Box>
				)}
			</Skeleton>

			<ButtonContainer mt="auto">
				<Button variant="default" onClick={() => context.closeModal(id)}>
					Close
				</Button>

				<Button onClick={openCreateModal}>Create API Token</Button>
			</ButtonContainer>
		</Stack>
	);
};
