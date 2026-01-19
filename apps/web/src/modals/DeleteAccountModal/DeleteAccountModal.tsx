import { useMutation } from '@apollo/client';
import { Button, Text, Stack, TextInput, Card, Alert, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { deleteAccountSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { DELETE_ACCOUNT } from '~lib/graphql';
import { client } from '~lib/graphql/client.ts';
import { router } from '~router/index.tsx';

export const DeleteAccountModal = ({ id, context }: ContextModalProps) => {
	const [deleteAccount, { loading, error }] = useMutation(DELETE_ACCOUNT);
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: '',
		},
		validate: zod4Resolver(deleteAccountSchema),
	});

	const handleDeleteAccount = async (values: typeof form.values) => {
		await deleteAccount({ variables: { data: values } });
		await client.cache.reset();
		await router.invalidate();
		context.closeAll();
	};

	return (
		<Form onSubmit={form.onSubmit(handleDeleteAccount)} error={error}>
			{({ error }) => (
				<Stack gap="xl" flex={1}>
					<Alert color="red" icon={<IconAlertTriangleFilled />} variant="light">
						This action is <strong>irreversible</strong> and will{' '}
						<strong>instantly and permanently delete</strong> all your data. You will
						not be able to recover your account once this is done.
					</Alert>

					<Card>
						<Stack gap="md">
							<Text size="sm">To confirm, please enter your email address:</Text>

							<TextInput
								placeholder="Enter your email address"
								key={form.key('emailAddress')}
								{...form.getInputProps('emailAddress')}
							/>
						</Stack>

						{error && <Box mt="sm">{error}</Box>}
					</Card>

					<ButtonContainer>
						<Button
							variant="default"
							onClick={() => context.closeModal(id)}
							loading={loading}
						>
							Cancel
						</Button>

						<Button color="red" type="submit" loading={loading}>
							Delete Account
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
