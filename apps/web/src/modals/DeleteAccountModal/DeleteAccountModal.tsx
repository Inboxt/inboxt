import { useMutation } from '@apollo/client';
import { Button, Text, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';

import { deleteAccountSchema } from '@inbox-reader/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { DELETE_ACCOUNT } from '~lib/graphql';
import { client } from '~lib/graphql/client';

import { router } from '../../main';

export const DeleteAccountModal = ({ id, context }: ContextModalProps) => {
	const [deleteAccount, { loading, error }] = useMutation(DELETE_ACCOUNT);
	const form = useForm({
		initialValues: {
			emailAddress: '',
		},
		validate: zodResolver(deleteAccountSchema),
	});

	const handleDeleteAccount = async (values: typeof form.values) => {
		await deleteAccount({ variables: { data: values } });
		await client.cache.reset();
		await router.invalidate();
		context.closeAll();
	};

	return (
		<Form onSubmit={form.onSubmit(handleDeleteAccount)} error={error} style={{ flex: 1 }}>
			{({ error }) => (
				<Stack flex={1}>
					<Text>Are you sure you want to delete your account?</Text>
					<Text>
						This action is{' '}
						<Text span fw={700} td="underline">
							irreversible
						</Text>{' '}
						and will{' '}
						<Text span fw={700} td="underline">
							instantly and permanently delete
						</Text>{' '}
						all your data. You will not be able to recover your account once this is
						done.
					</Text>

					<Text>To confirm, please enter your email address:</Text>

					<TextInput
						placeholder="Enter your email address"
						{...form.getInputProps('emailAddress')}
					/>

					{error}

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
