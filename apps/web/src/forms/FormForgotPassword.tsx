import { Button, Divider, Group, Text, TextInput } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { LoginViewProps } from '../pages/Login/Login.tsx';

// todo: real form with Mantine :)
export const FormForgotPassword = ({
	handleLoginViewChange,
}: LoginViewProps) => {
	const [forgotPasswordStep, setForgotPasswordStep] = useState(0);

	const handleBack = () => {
		if (forgotPasswordStep === 1) {
			setForgotPasswordStep(0);
		} else {
			handleLoginViewChange('login');
		}
	};

	return (
		<>
			{forgotPasswordStep === 0 && (
				<>
					<TextInput
						label="Email"
						placeholder="Enter your email address"
						leftSectionPointerEvents="none"
						leftSection={<IconAt size={16} />}
						size="md"
					/>

					<Text fz="sm">
						Enter the email you used to create your account. We'll
						send you a "reset code" so you can set a new password.
					</Text>
				</>
			)}

			{forgotPasswordStep === 1 && (
				<>
					<Text fz="sm">
						You will receive an email with a "reset code." Enter
						that code here, then enter your new password.
					</Text>

					<TextInput
						label="Reset code"
						placeholder="Looks like XXXXX-XXXXX"
						leftSectionPointerEvents="none"
						leftSection={<IconAt size={16} />}
						size="md"
					/>

					<TextInput
						type="password"
						label="New password"
						placeholder="Choose your new password"
						leftSectionPointerEvents="none"
						leftSection={<IconLock size={16} />}
						size="md"
					/>
				</>
			)}

			<Group mt="xl" justify="space-between">
				<Button variant="default" size="md" onClick={handleBack}>
					Back
				</Button>
				<Button size="md">
					{forgotPasswordStep === 0 ? 'Next' : 'Reset'}
				</Button>
			</Group>

			<Divider my="xxs" />

			<Button
				variant="subtle"
				mx="auto"
				onClick={() => setForgotPasswordStep(1)}
			>
				Already have a code?
			</Button>
		</>
	);
};
