import { useMutation } from '@apollo/client';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconMail } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { createAccountSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { CREATE_ACCOUNT } from '~lib/graphql';
import { AuthViewProps } from '~pages/Auth/Auth';

export const FormCreateAccount = ({ handleChangeAuthMode }: AuthViewProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as { emailAddress?: string } | undefined;
	const [createAccount, { loading: loadingCreateAccount, error }] = useMutation(CREATE_ACCOUNT);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: state?.emailAddress || '',
			username: '',
			password: '',
		},
		validate: zod4Resolver(createAccountSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await createAccount({ variables: { data: values } });
		return navigate({ to: '/' });
	};

	return (
		<Form onSubmit={form.onSubmit(handleSubmit)} error={error}>
			{({ error }) => (
				<Stack>
					<TextInput
						label="Email"
						placeholder="Enter your email address"
						leftSectionPointerEvents="none"
						leftSection={<IconAt size={16} />}
						size="md"
						key={form.key('emailAddress')}
						{...form.getInputProps('emailAddress')}
					/>

					<TextInput
						label="Username"
						placeholder="Type your desired username"
						leftSectionPointerEvents="none"
						leftSection={<IconMail size={16} />}
						size="md"
						key={form.key('username')}
						{...form.getInputProps('username')}
					/>

					<PasswordInput
						type="password"
						label="Password"
						placeholder="Choose your password"
						leftSectionPointerEvents="none"
						leftSection={<IconLock size={16} />}
						size="md"
						key={form.key('password')}
						{...form.getInputProps('password')}
					/>

					{error}

					<ButtonContainer mt="xl">
						<Button
							variant="default"
							size="md"
							onClick={() =>
								void handleChangeAuthMode(undefined, form.getValues().emailAddress)
							}
							loading={loadingCreateAccount}
						>
							Back
						</Button>

						<Button size="md" type="submit" loading={loadingCreateAccount}>
							Create account
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
