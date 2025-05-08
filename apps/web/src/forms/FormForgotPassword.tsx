import {
	Button,
	Divider,
	Group,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@apollo/client';
import { resetPasswordSchema, requestPasswordRecoverySchema } from '@inbox-reader/schemas';

import { AuthViewProps } from '../pages/Auth/Auth.tsx';
import { REQUEST_PASSWORD_RECOVERY, RESET_PASSWORD } from '../lib/graphql.ts';
import { Form } from '../components/Form';

export const FormForgotPassword = ({ handleChangeAuthMode }: AuthViewProps) => {
	const navigate = useNavigate();
	const [
		requestPasswordRecovery,
		{ loading: requestPasswordRecoveryLoading, error: requestPasswordRecoveryError },
	] = useMutation(REQUEST_PASSWORD_RECOVERY);

	const [resetPassword, { loading: resetPasswordLoading, error: resetPasswordError }] =
		useMutation(RESET_PASSWORD);

	const [isPasswordReset, setIsPasswordReset] = useState(false);
	const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
	const requestPasswordRecoveryForm = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: '',
		},
		validate: zodResolver(requestPasswordRecoverySchema),
	});

	const resetPasswordForm = useForm({
		mode: 'uncontrolled',
		initialValues: {
			emailAddress: '',
			code: '',
			password: '',
		},
		validate: zodResolver(resetPasswordSchema),
	});

	const handleBack = () => {
		if (forgotPasswordStep === 1) {
			setForgotPasswordStep(0);
		} else {
			handleChangeAuthMode('login');
		}
	};

	const handleRequestPasswordRecovery = async (
		values: typeof requestPasswordRecoveryForm.values,
	) => {
		await requestPasswordRecovery({ variables: { data: values } });

		setForgotPasswordStep(1);
		resetPasswordForm.setFieldValue(
			'emailAddress',
			requestPasswordRecoveryForm.getValues().emailAddress,
		);
	};

	const handleResetPassword = async (values: typeof resetPasswordForm.values) => {
		await resetPassword({ variables: { data: values } });
		setIsPasswordReset(true);
	};

	useEffect(() => {
		return () => setIsPasswordReset(false);
	}, []);

	if (isPasswordReset) {
		return (
			<Stack align="center">
				<Title order={3}>Password updated!</Title>
				<Text>You can now sign in with your new password</Text>

				<Button
					onClick={() =>
						navigate({
							to: '/auth',
							search: { mode: 'login' },
							state: {
								emailAddress: resetPasswordForm.getValues().emailAddress,
							},
						})
					}
				>
					Okay
				</Button>
			</Stack>
		);
	}

	return (
		<Form
			onSubmit={
				forgotPasswordStep === 0
					? requestPasswordRecoveryForm.onSubmit(handleRequestPasswordRecovery)
					: resetPasswordForm.onSubmit(handleResetPassword)
			}
			error={requestPasswordRecoveryError || resetPasswordError}
		>
			{({ error }) => (
				<Stack>
					{forgotPasswordStep === 0 && (
						<>
							<TextInput
								label="Email"
								placeholder="Enter your email address"
								leftSectionPointerEvents="none"
								leftSection={<IconAt size={16} />}
								size="md"
								{...requestPasswordRecoveryForm.getInputProps('emailAddress')}
							/>

							<Text fz="sm">
								Enter the email you used to create your account. We'll send you a
								"reset code" so you can set a new password.
							</Text>
						</>
					)}

					{forgotPasswordStep === 1 && (
						<>
							<Text fz="sm">
								You will receive an email with a "reset code." Enter that code here,
								then enter your new password.
							</Text>

							<TextInput
								label="Email"
								placeholder="Enter your email address"
								leftSectionPointerEvents="none"
								leftSection={<IconAt size={16} />}
								size="md"
								{...resetPasswordForm.getInputProps('emailAddress')}
							/>

							<TextInput
								label="Reset code"
								placeholder="Looks like XXXXX-XXXXX"
								leftSectionPointerEvents="none"
								leftSection={<IconAt size={16} />}
								size="md"
								{...resetPasswordForm.getInputProps('code')}
							/>

							<PasswordInput
								type="password"
								label="New password"
								placeholder="Choose your new password"
								leftSectionPointerEvents="none"
								leftSection={<IconLock size={16} />}
								size="md"
								{...resetPasswordForm.getInputProps('password')}
							/>
						</>
					)}

					{error}

					<Group mt="xl" justify="space-between">
						<Button variant="default" size="md" onClick={handleBack}>
							Back
						</Button>
						<Button
							size="md"
							type="submit"
							loading={requestPasswordRecoveryLoading || resetPasswordLoading}
						>
							{forgotPasswordStep === 0 ? 'Next' : 'Reset'}
						</Button>
					</Group>

					{forgotPasswordStep === 0 && (
						<>
							<Divider my="xxs" />

							<Button
								variant="subtle"
								mx="auto"
								onClick={() => setForgotPasswordStep(1)}
							>
								Already have a code?
							</Button>
						</>
					)}
				</Stack>
			)}
		</Form>
	);
};
