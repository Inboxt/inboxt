import {
	Anchor,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconAt, IconLock, IconMail } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@mantine/form';
import { useMutation } from '@apollo/client';

import { AuthViewProps } from '../pages/Auth/Auth.tsx';
import { CREATE_ACCOUNT } from '../lib/graphql.ts';
import { Form } from '../components/Form';

export const FormCreateAccount = ({ handleChangeAuthMode }: AuthViewProps) => {
	const navigate = useNavigate();
	const [createAccount, { loading: loadingCreateAccount, error }] =
		useMutation(CREATE_ACCOUNT);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: '',
			username: '',
			password: '',
		},
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

					<TextInput
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

					<Group mt="xl" justify="space-between">
						<Button
							variant="default"
							size="md"
							onClick={() => handleChangeAuthMode(undefined)}
							loading={loadingCreateAccount}
						>
							Back
						</Button>
						<Button
							size="md"
							type="submit"
							loading={loadingCreateAccount}
						>
							Create account
						</Button>
					</Group>

					<Divider my="xxs" />

					<Text fz="sm">
						Having trouble? <Anchor fz="sm">Contact support</Anchor>
					</Text>
				</Stack>
			)}
		</Form>
	);
};
