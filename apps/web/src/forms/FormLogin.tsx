import { Button, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@apollo/client';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { signInSchema } from '@inbox-reader/schemas';

import { AuthViewProps } from '../pages/Auth/Auth.tsx';
import { SIGN_IN } from '../lib/graphql.ts';
import { Route } from '../routes/auth.route.tsx';
import { Form } from '../components/Form';

export const FormLogin = ({ handleChangeAuthMode }: AuthViewProps) => {
	const [signIn, { loading, error }] = useMutation(SIGN_IN);
	const state = useRouterState({ select: (s) => s.location.state });
	const navigate = useNavigate({ from: Route.id });

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: state?.emailAddress || '',
			password: '',
		},
		validate: zodResolver(signInSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await signIn({
			variables: {
				data: values,
			},
		});

		await navigate({ to: '/' });
	};

	return (
		<Form onSubmit={form.onSubmit(handleSubmit)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack>
					<TextInput
						label="Email"
						placeholder="Email address"
						leftSectionPointerEvents="none"
						leftSection={<IconAt size={16} />}
						size="md"
						{...form.getInputProps('emailAddress')}
					/>

					<PasswordInput
						type="password"
						label="Password"
						placeholder="Password"
						leftSectionPointerEvents="none"
						leftSection={<IconLock size={16} />}
						rightSectionPointerEvents="auto"
						rightSectionWidth="auto"
						rightSection={
							<Button
								variant="subtle"
								color="gray"
								size="compact-xs"
								mr="xs"
								onClick={() => handleChangeAuthMode('forgot-password')}
							>
								Forgot?
							</Button>
						}
						{...form.getInputProps('password')}
						size="md"
					/>

					{error}

					<Group mt="xl" justify="space-between">
						<Button
							variant="default"
							size="md"
							onClick={() => handleChangeAuthMode(undefined)}
							loading={loading}
						>
							Back
						</Button>
						<Button size="md" type="submit" loading={loading}>
							Sign in
						</Button>
					</Group>
				</Stack>
			)}
		</Form>
	);
};
