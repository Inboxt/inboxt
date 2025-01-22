import { Button, Group, TextInput } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';

import { LoginViewProps } from '../pages/Login/Login.tsx';

// todo: real form with Mantine :)
export const FormLogin = ({ handleLoginViewChange }: LoginViewProps) => {
	return (
		<>
			<TextInput
				label="Email"
				placeholder="Email address"
				leftSectionPointerEvents="none"
				leftSection={<IconAt size={16} />}
				size="md"
			/>

			<TextInput
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
						onClick={() => handleLoginViewChange('forgot-password')}
					>
						Forgot?
					</Button>
				}
				size="md"
			/>

			<Group mt="xl" justify="space-between">
				<Button
					variant="default"
					size="md"
					onClick={() => handleLoginViewChange(null)}
				>
					Back
				</Button>
				<Button size="md">Sign in</Button>
			</Group>
		</>
	);
};
