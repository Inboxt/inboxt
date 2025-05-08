import {
	Stack,
	TextInput,
	Button,
	Group,
	Progress,
	Text,
	SegmentedControl,
	Title,
	Divider,
	Skeleton,
	useMantineColorScheme,
	useComputedColorScheme,
	Alert,
} from '@mantine/core';
import { IconBell, IconDatabase, IconHighlight } from '@tabler/icons-react';
import { ContextModalProps } from '@mantine/modals';
import { useMutation, useQuery } from '@apollo/client';
import { useForm, zodResolver } from '@mantine/form';

import { updateAccountSchema } from '@inbox-reader/schemas';

import { modals } from '@modals/modals.ts';
import { ACTIVE_USER, UPDATE_ACCOUNT } from '../../lib/graphql.ts';
import { Form } from '../../components/Form';
import { router } from '../../main.tsx';

export const ProfileModal = ({ id, context }: ContextModalProps) => {
	const { setColorScheme, colorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme();

	const { data, loading } = useQuery(ACTIVE_USER);
	const [updateProfile, { loading: updateProfileLoading, error: updateProfileError }] =
		useMutation(UPDATE_ACCOUNT);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			username: data?.me?.username ?? '',
			emailAddress: data?.me?.emailAddress ?? '',
		},
		validate: zodResolver(updateAccountSchema),
	});

	const handleUpdateProfile = async (values: typeof form.values) => {
		await updateProfile({
			variables: {
				data: {
					username: values.username,
					emailAddress: values.emailAddress,
				},
			},
			refetchQueries: [{ query: ACTIVE_USER }],
		});

		if (form.isDirty('emailAddress')) {
			return router.invalidate();
		}

		return context.closeModal(id);
	};

	const usedStorage = 3;
	const totalStorage = 10;
	const storagePercentage = (usedStorage / totalStorage) * 100;

	return (
		<Form onSubmit={form.onSubmit(handleUpdateProfile)} error={updateProfileError}>
			{({ error }) => (
				<Stack gap="xl">
					<Stack>
						<Skeleton visible={loading}>
							<TextInput
								label="Name"
								placeholder="Enter your name"
								{...form.getInputProps('username')}
							/>
						</Skeleton>

						<Skeleton visible={loading}>
							<Stack gap="xxs">
								<TextInput
									label="Email address"
									placeholder="Enter your email address"
									{...form.getInputProps('emailAddress')}
								/>

								{data?.me?.pendingEmailAddress && (
									<Alert color="yellow" icon={<IconBell />} p="xxs">
										{`Verification email sent to ${data.me.pendingEmailAddress}. Your email will be
										updated once verified.`}
									</Alert>
								)}
							</Stack>
						</Skeleton>

						{error}
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
						<Skeleton visible={loading}>
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
						</Skeleton>
					</Stack>

					<Divider />

					<Stack gap="xs">
						<Title order={5}>Export Data</Title>

						<Text>
							You can request data export once per day. The export will be sent to
							your registered email address, and you should receive it within an hour.
							The download link will remain valid for 24 hours.
						</Text>

						<Group grow>
							<Button leftSection={<IconDatabase size={16} />} variant="default">
								Export Full Account Data
							</Button>

							<Button leftSection={<IconHighlight size={16} />} variant="default">
								Export Highlights
							</Button>
						</Group>
					</Stack>

					<Group justify="space-between">
						<Button
							variant="outline"
							color="red"
							onClick={modals.openDeleteAccountModal}
						>
							Delete Account
						</Button>
						<Group>
							<Button
								variant="default"
								onClick={() => context.closeModal(id)}
								loading={updateProfileLoading}
							>
								Cancel
							</Button>
							<Button type="submit" loading={updateProfileLoading}>
								Save
							</Button>
						</Group>
					</Group>
				</Stack>
			)}
		</Form>
	);
};
