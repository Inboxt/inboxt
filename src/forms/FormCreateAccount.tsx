import { Anchor, Button, Divider, Group, Text, TextInput } from '@mantine/core';
import { IconAt, IconLock, IconMail } from '@tabler/icons-react';
import { LoginViewProps } from '../pages/Login/Login.tsx';

// todo: real form with Mantine :)
export const FormCreateAccount = ({
	handleLoginViewChange,
}: LoginViewProps) => {
	return (
		<>
			<TextInput
				label="Email"
				placeholder="Enter your email address"
				leftSectionPointerEvents="none"
				leftSection={<IconAt size={16} />}
				size="md"
			/>

			<TextInput
				label="Username"
				placeholder="Type your desired username"
				leftSectionPointerEvents="none"
				leftSection={<IconMail size={16} />}
				size="md"
			/>

			<TextInput
				type="password"
				label="Password"
				placeholder="Choose your password"
				leftSectionPointerEvents="none"
				leftSection={<IconLock size={16} />}
				size="md"
			/>

			<Text fz="sm">
				By creating an account you agree to the{' '}
				<Anchor fz="sm">Terms of Service</Anchor> and{' '}
				<Anchor fz="sm">Privacy Policy</Anchor>.
			</Text>

			<Group mt="xl" justify="space-between">
				<Button
					variant="default"
					size="md"
					onClick={() => handleLoginViewChange(null)}
				>
					Back
				</Button>
				<Button size="md">Create account</Button>
			</Group>

			<Divider my="xxs" />

			<Text fz="sm">
				Having trouble? <Anchor fz="sm">Contact support</Anchor>
			</Text>
		</>
	);
};
