import { useMutation, useQuery } from '@apollo/client';
import {
	Accordion,
	Alert,
	Box,
	Button,
	Card,
	Flex,
	MantineColorScheme,
	Progress,
	SegmentedControl,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
	useComputedColorScheme,
	useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { IconBell, IconDatabase, IconHighlight, IconTag, IconPuzzle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

dayjs.extend(duration);

import {
	formatBytes,
	updateAccountSchema,
	USER_INBOUND_EMAIL_ADDRESS_LIMIT,
	USER_LABELS_LIMIT,
} from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { toastSuccess } from '~components/Toast';
import { useScreenQuery } from '~hooks/useScreenQuery.tsx';
import { ACTIVE_USER, ExportType, UPDATE_ACCOUNT } from '~lib/graphql';
import { modals } from '~modals/modals';
import { router } from '~router/index.tsx';
import { getUserStorage } from '~utils/userStorage.ts';

export const ProfileModal = ({ id, context }: ContextModalProps) => {
	const { setColorScheme, colorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme();
	const isBelowXsScreen = useScreenQuery('xs', 'below');

	const { data, loading } = useQuery(ACTIVE_USER, { fetchPolicy: 'cache-and-network' });
	const { storageQuota, storagePercentage, usedStorage } = getUserStorage(data?.me);

	const [updateProfile, { loading: updateProfileLoading, error: updateProfileError }] =
		useMutation(UPDATE_ACCOUNT);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			username: '',
			emailAddress: '',
		},
		validate: zod4Resolver(updateAccountSchema),
	});

	useEffect(() => {
		if (data?.me) {
			form.initialize({
				username: data.me.username,
				emailAddress: data.me.emailAddress,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

		if (form.isDirty()) {
			toastSuccess({
				title: 'Your profile was successfully updated.',
			});
		}

		context.closeModal(id);
	};

	const labelsUsed = data?.me?.labelsCount ?? 0;
	const inboundEmailAddressesUsed = data?.me?.inboundEmailAddressesCount ?? 0;

	const lastExportAt = data?.me?.lastExportAt;
	const now = dayjs();
	const last = lastExportAt ? dayjs(lastExportAt) : null;
	const isBlocked = !!last && now.diff(last, 'hour') < 24;
	const msLeft = isBlocked ? dayjs.duration(24, 'hour').asMilliseconds() - now.diff(last) : 0;
	const duration = dayjs.duration(msLeft);

	return (
		<Form onSubmit={form.onSubmit(handleUpdateProfile)} error={updateProfileError}>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Skeleton visible={loading}>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
								<TextInput
									label="Name"
									key={form.key('username')}
									{...form.getInputProps('username')}
								/>
								<TextInput
									label="Email"
									key={form.key('emailAddress')}
									{...form.getInputProps('emailAddress')}
								/>
							</SimpleGrid>

							{data?.me?.pendingEmailAddress && (
								<Alert color="yellow" icon={<IconBell />} mt="sm">
									Verification email sent to <b>{data.me.pendingEmailAddress}</b>.
									Your email will be updated once verified.
								</Alert>
							)}
						</Skeleton>

						{error && <Box mt="sm">{error}</Box>}
					</Card>

					<Card>
						<Title order={5}>Theme</Title>
						<SegmentedControl
							fullWidth
							mt="sm"
							color={computedColorScheme === 'dark' ? undefined : 'dark'}
							value={colorScheme}
							onChange={(value) => setColorScheme(value as MantineColorScheme)}
							data={[
								{ label: 'System', value: 'auto' },
								{ label: 'Light', value: 'light' },
								{ label: 'Dark', value: 'dark' },
							]}
						/>
					</Card>

					<Card>
						<Stack gap="md">
							<Title order={5}>Install & access</Title>
							<Flex
								justify="space-between"
								align={{ base: 'stretch', xs: 'center' }}
								gap="md"
								direction={{ base: 'column', xs: 'row' }}
							>
								<Stack gap={2}>
									<Text size="sm">Browser extension</Text>
									<Text size="xs" c="dimmed">
										Save pages with one click from your browser toolbar.
									</Text>
								</Stack>

								<Button
									component="a"
									href="https://inboxt.app/install"
									size="xs"
									variant="light"
									leftSection={<IconPuzzle size={14} />}
								>
									Install
								</Button>
							</Flex>

							<Flex
								justify="space-between"
								align={{ base: 'stretch', xs: 'center' }}
								gap="md"
								direction={{ base: 'column', xs: 'row' }}
							>
								<Stack gap={2}>
									<Text size="sm">Add to home screen</Text>
									<Text size="xs" c="dimmed">
										Get quick access to Inboxt on mobile or desktop.
									</Text>
								</Stack>

								<Button
									component="a"
									href="https://docs.inboxt.app/installation#mobile-and-progressive-web-app"
									size="xs"
									variant="default"
								>
									View instructions
								</Button>
							</Flex>
						</Stack>
					</Card>

					<Card>
						<Flex
							justify="space-between"
							align={{ base: 'stretch', xs: 'center' }}
							gap="md"
							direction={{ base: 'column', xs: 'row' }}
						>
							<Stack gap="xxxs" maw={isBelowXsScreen ? '100%' : '60%'}>
								<Title order={5}>Email Addresses</Title>

								<Text size="xs" c="dimmed">
									{`${inboundEmailAddressesUsed} of ${USER_INBOUND_EMAIL_ADDRESS_LIMIT} addresses used`}
								</Text>

								<Text size="xs" c="dimmed">
									Create private email addresses to receive newsletters and other
									messages directly in Inboxt.
								</Text>
							</Stack>

							<Button size="xs" variant="light" onClick={modals.openEmailsModal}>
								Manage
							</Button>
						</Flex>
					</Card>

					<Card>
						<Skeleton visible={loading}>
							<Flex
								justify="space-between"
								align={{ base: 'stretch', xs: 'center' }}
								gap="md"
								direction={{ base: 'column', xs: 'row' }}
							>
								<Stack gap="xxxs">
									<Title order={5}>Labels</Title>
									<Text
										size="xs"
										c={labelsUsed >= USER_LABELS_LIMIT ? 'red' : 'dimmed'}
									>
										{labelsUsed} of {USER_LABELS_LIMIT} labels used
									</Text>
									<Text size="xs" c="dimmed">
										Use labels to organize your saved content.
									</Text>
								</Stack>
								<Button
									onClick={modals.openLabelsModal}
									size="xs"
									variant="light"
									disabled={labelsUsed >= USER_LABELS_LIMIT}
								>
									Manage
								</Button>
							</Flex>

							{labelsUsed >= USER_LABELS_LIMIT && (
								<Alert color="red" icon={<IconTag />} mt="sm">
									You have reached your label limit. Please delete a label before
									creating a new one.
								</Alert>
							)}
						</Skeleton>
					</Card>

					<Card>
						<Skeleton visible={loading}>
							<Title order={5}>Storage Usage</Title>
							<Stack gap="xs" mt="sm">
								<Progress
									value={storagePercentage}
									size="sm"
									radius="md"
									color="primary"
								/>
								<Text size="xs" c="dimmed">
									{`${formatBytes(usedStorage)} of ${formatBytes(storageQuota)} used`}
								</Text>
							</Stack>
						</Skeleton>
					</Card>

					{loading ? (
						<Skeleton visible={loading} height={48} />
					) : (
						<Accordion variant="separated" radius="md">
							<Accordion.Item value="export">
								<Accordion.Control>Export Your Data</Accordion.Control>
								<Accordion.Panel>
									<Stack gap="xs">
										<Text size="sm">
											Choose how to export your data: full account export
											(once every 24 hours, sent by email) or highlights only
											(unlimited, downloads in your browser; large files may
											be emailed).
										</Text>

										<Flex gap="md" direction={{ base: 'column', xs: 'row' }}>
											<Button
												leftSection={<IconDatabase size={16} />}
												variant="default"
												fullWidth
												onClick={() =>
													modals.openExportDataModal({
														title: 'Export Full Account Data',
														type: ExportType.All,
													})
												}
												disabled={isBlocked}
											>
												Export Full Account Data
											</Button>

											<Button
												leftSection={<IconHighlight size={16} />}
												variant="default"
												fullWidth
												onClick={() =>
													modals.openExportDataModal({
														title: 'Export Highlights',
														type: ExportType.Highlights,
													})
												}
											>
												Export Highlights
											</Button>
										</Flex>

										{isBlocked && (
											<Text size="xs" c="dimmed" ta="center">
												{`You recently requested a full export. You can request another full export in ${duration.hours()}h ${duration.minutes()}m.`}
											</Text>
										)}
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					)}

					<ButtonContainer>
						<Button
							variant="default"
							onClick={() => context.closeModal(id)}
							loading={updateProfileLoading}
						>
							Cancel
						</Button>

						<Flex gap="md" direction={{ base: 'column', xs: 'row' }}>
							<Button
								variant="light"
								color="red"
								onClick={modals.openDeleteAccountModal}
							>
								Delete Account
							</Button>

							<Button type="submit" loading={updateProfileLoading}>
								Save
							</Button>
						</Flex>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
