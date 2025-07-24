import {
	Card,
	Stack,
	TextInput,
	Button,
	Group,
	Progress,
	Text,
	SegmentedControl,
	Title,
	Accordion,
	Alert,
	SimpleGrid,
	Skeleton,
	useMantineColorScheme,
	useComputedColorScheme,
} from '@mantine/core';
import { IconBell, IconDatabase, IconHighlight, IconTag } from '@tabler/icons-react';
import { ContextModalProps } from '@mantine/modals';
import { useMutation, useQuery } from '@apollo/client';
import { useForm, zodResolver } from '@mantine/form';
import { useEffect } from 'react';

import { updateAccountSchema } from '@inbox-reader/schemas';

import { modals } from '@modals/modals.ts';
import { ACTIVE_USER, UPDATE_ACCOUNT } from '../../lib/graphql.ts';
import { Form } from '../../components/Form';
import { router } from '../../main.tsx';

export const ProfileModal = ({ id, context }: ContextModalProps) => {
	const { setColorScheme, colorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme();

	const { data } = useQuery(ACTIVE_USER, { fetchPolicy: 'cache-and-network' });
	const [updateProfile, { loading: updateProfileLoading, error: updateProfileError }] =
		useMutation(UPDATE_ACCOUNT);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			username: '',
			emailAddress: '',
		},
		validate: zodResolver(updateAccountSchema),
	});

	useEffect(() => {
		if (data?.me) {
			form.initialize({
				username: data.me.username,
				emailAddress: data.me.emailAddress,
			});
		}
	}, [data?.me]);

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
	const labelLimit = 50; // todo: move to shared const
	const labelsUsed = data?.me?.labelsCount ?? 0;

	const loading = true;
	return (
		<Form onSubmit={form.onSubmit(handleUpdateProfile)} error={updateProfileError}>
			{({ error }) => (
				<Stack gap="xl">
					<Card withBorder radius="md">
						<Skeleton visible={loading}>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
								<TextInput label="Name" {...form.getInputProps('username')} />
								<TextInput label="Email" {...form.getInputProps('emailAddress')} />
							</SimpleGrid>
							{data?.me?.pendingEmailAddress && (
								<Alert color="yellow" icon={<IconBell />} mt="sm">
									Verification email sent to <b>{data.me.pendingEmailAddress}</b>.
									Your email will be updated once verified.
								</Alert>
							)}
						</Skeleton>
						{error}
					</Card>

					<Card withBorder radius="md">
						<Title order={5}>Theme</Title>
						<SegmentedControl
							fullWidth
							mt="sm"
							color={computedColorScheme === 'dark' ? undefined : 'dark'}
							value={colorScheme}
							onChange={setColorScheme}
							data={[
								{ label: 'System', value: 'auto' },
								{ label: 'Light', value: 'light' },
								{ label: 'Dark', value: 'dark' },
							]}
						/>
					</Card>

					<Card withBorder radius="md">
						<Group justify="space-between">
							<Stack gap="xxxs">
								<Title order={5}>Newsletters</Title>

								<Text size="xs" c="dimmed">
									2 of 5 newsletter addresses used
								</Text>

								<Text size="xs" c="dimmed">
									Create private email addresses to receive newsletters inside
									Inbox-Reader.
								</Text>
							</Stack>

							<Button size="xs" variant="light" onClick={modals.openNewslettersModal}>
								Manage
							</Button>
						</Group>
					</Card>

					<Card withBorder radius="md">
						<Skeleton visible={loading}>
							<Group justify="space-between">
								<Stack gap="xxxs">
									<Title order={5}>Labels</Title>
									<Text size="xs" c={labelsUsed >= labelLimit ? 'red' : 'dimmed'}>
										{labelsUsed} of {labelLimit} labels used
									</Text>
									<Text size="xs" c="dimmed">
										Use labels to organize your saved content.
									</Text>
								</Stack>
								<Button
									onClick={modals.openLabelsModal}
									size="xs"
									variant="light"
									disabled={labelsUsed >= labelLimit}
								>
									Manage
								</Button>
							</Group>

							{labelsUsed >= labelLimit && (
								<Alert color="red" icon={<IconTag />} mt="sm">
									You have reached your label limit. Please delete a label before
									creating a new one.
								</Alert>
							)}
						</Skeleton>
					</Card>

					<Card withBorder radius="md">
						<Skeleton visible={loading}>
							<Title order={5}>Storage Usage</Title>
							<Stack gap="xs" mt="sm">
								<Progress
									value={storagePercentage}
									size="sm"
									radius="md"
									color="blue"
								/>
								<Text size="xs" c="dimmed">
									{usedStorage}GB of {totalStorage}GB used
								</Text>
							</Stack>
						</Skeleton>
					</Card>

					<Accordion variant="separated" radius="md">
						<Accordion.Item value="export">
							<Accordion.Control>Export Your Data</Accordion.Control>
							<Accordion.Panel>
								<Stack gap="xs">
									<Text size="sm">
										You can request data export once per day. The export will be
										sent to your registered email address and should arrive
										within an hour.
									</Text>

									<Text size="xs" c="dimmed">
										Download link will be valid for 24 hours.
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
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>

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
