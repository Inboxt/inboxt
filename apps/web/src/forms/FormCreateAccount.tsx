import { useMutation } from '@apollo/client';
import { Anchor, Button, Divider, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAt, IconLock, IconMail } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { createAccountSchema } from '@inbox-reader/common';

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
		validate: zodResolver(createAccountSchema),
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
						{...form.getInputProps('emailAddress')}
					/>

					<TextInput
						label="Username"
						placeholder="Type your desired username"
						leftSectionPointerEvents="none"
						leftSection={<IconMail size={16} />}
						size="md"
						{...form.getInputProps('username')}
					/>

					<PasswordInput
						type="password"
						label="Password"
						placeholder="Choose your password"
						leftSectionPointerEvents="none"
						leftSection={<IconLock size={16} />}
						size="md"
						{...form.getInputProps('password')}
					/>

					{error}

					<Text fz="sm">
						By creating an account you agree to the{' '}
						<Anchor fz="sm">Terms of Service</Anchor> and{' '}
						<Anchor fz="sm">Privacy Policy</Anchor>.
					</Text>

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

					<Divider my="xxs" />

					<Text fz="sm" ta="center">
						Having trouble? <Anchor fz="sm">Contact support</Anchor>
					</Text>
				</Stack>
			)}
		</Form>
	);
};
