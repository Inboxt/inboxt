import { useMutation } from '@apollo/client';
import { Button, Card, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useInterval } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';

import { verifyEmailSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { ACTIVE_USER, RESEND_VERIFICATION_EMAIL, VERIFY_EMAIL } from '~lib/graphql';

import { router } from '../../main';

export const VerifyEmailModal = ({ id, context }: ContextModalProps) => {
	const [resendCooldown, setResendCooldown] = useState(0);
	const [verifyEmail, { loading: verifyEmailLoading, error: verifyEmailError }] =
		useMutation(VERIFY_EMAIL);

	const [resendVerificationEmail, { loading: resendVerificationEmailLoading }] =
		useMutation(RESEND_VERIFICATION_EMAIL);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			code: '',
		},
		validate: zod4Resolver(verifyEmailSchema),
	});

	const interval = useInterval(() => {
		setResendCooldown((prev) => {
			if (prev <= 1) {
				interval.stop();
				return 0;
			}
			return prev - 1;
		});
	}, 1000);

	const handleVerifyEmail = async (values: typeof form.values) => {
		await verifyEmail({
			variables: {
				data: values,
			},
			refetchQueries: [{ query: ACTIVE_USER }],
		});
		await router.invalidate();
		context.closeModal(id);
	};

	const handleResendEmail = async () => {
		await resendVerificationEmail();
		setResendCooldown(59);
		interval.start();
	};

	const isCooldownActive = resendCooldown > 0;

	return (
		<Form onSubmit={form.onSubmit(handleVerifyEmail)} error={verifyEmailError}>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Stack gap="md">
							<Text size="sm">
								We've sent you an email with a confirmation code. Please check your
								inbox and spam folder. Enter the code below to verify your email
								address.
							</Text>

							<TextInput
								label="Confirmation Code"
								placeholder="XXXXX-XXXXX"
								{...form.getInputProps('code')}
							/>
						</Stack>

						{error}
					</Card>

					<ButtonContainer>
						<Button
							variant="light"
							color="text"
							onClick={handleResendEmail}
							loading={resendVerificationEmailLoading || verifyEmailLoading}
							disabled={isCooldownActive}
						>
							{isCooldownActive ? `Send again in ${resendCooldown}s` : 'Resend Email'}
						</Button>

						<Button
							type="submit"
							loading={resendVerificationEmailLoading || verifyEmailLoading}
						>
							Confirm
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};
