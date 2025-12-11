import { useMutation } from '@apollo/client';
import { ActionIcon, Button, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconAt, IconEye, IconEyeOff, IconLock } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { signInSchema } from '@inboxt/common';
import { SIGN_IN } from '@inboxt/graphql';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { AuthViewProps } from '~pages/Auth/Auth';
import { Route } from '~routes/auth.route';

export const FormLogin = ({ handleChangeAuthMode }: AuthViewProps) => {
	const [showPassword, { toggle }] = useDisclosure(false);
	const [signIn, { loading, error }] = useMutation(SIGN_IN);
	const location = useLocation();
	const state = location.state as { emailAddress?: string } | undefined;
	const navigate = useNavigate({ from: Route.id });

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: state?.emailAddress || '',
			password: '',
		},
		validate: zod4Resolver(signInSchema),
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
						label="Password"
						placeholder="Password"
						leftSectionPointerEvents="none"
						leftSection={<IconLock size={16} />}
						rightSectionPointerEvents="auto"
						rightSectionWidth="auto"
						visible={showPassword}
						onVisibilityChange={toggle}
						rightSection={
							<Group gap="xxxs" wrap="nowrap" mr="xxs">
								<Button
									variant="subtle"
									color="gray"
									size="xs"
									onClick={() =>
										void handleChangeAuthMode(
											'forgot-password',
											form.getValues().emailAddress,
										)
									}
								>
									Forgot?
								</Button>

								<ActionIcon
									variant="subtle"
									color="gray"
									onClick={toggle}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? (
										<IconEyeOff size={16} />
									) : (
										<IconEye size={16} />
									)}
								</ActionIcon>
							</Group>
						}
						{...form.getInputProps('password')}
						size="md"
					/>

					{error}

					<ButtonContainer mt="xl">
						<Button
							variant="default"
							size="md"
							onClick={() =>
								void handleChangeAuthMode(undefined, form.getValues().emailAddress)
							}
							loading={loading}
						>
							Back
						</Button>
						<Button size="md" type="submit" loading={loading}>
							Sign in
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
