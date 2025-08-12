import {
	Anchor,
	Box,
	Button,
	Center,
	Divider,
	Flex,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useNavigate, useLocation, useSearch } from '@tanstack/react-router';

import { AppName } from '~components/AppName';
import { DemoLogin } from '~components/DemoLogin';
import { FormCreateAccount } from '~forms/FormCreateAccount';
import { FormForgotPassword } from '~forms/FormForgotPassword';
import { FormLogin } from '~forms/FormLogin';
import { AuthMode, Route } from '~routes/auth.route';

import classes from './Auth.module.css';

export type AuthViewProps = {
	handleChangeAuthMode: (mode: AuthMode, emailAddress?: string) => Promise<void>;
};

export const Auth = () => {
	const { mode } = useSearch({ from: Route.fullPath });
	const navigate = useNavigate({ from: Route.fullPath });
	const location = useLocation();
	const state = location.state as { emailAddress?: string } | undefined;

	const handleChangeAuthMode = async (mode: AuthMode, emailAddress?: string) => {
		await navigate({
			search: { mode },
			state: { emailAddress: emailAddress || state?.emailAddress },
		});
	};

	if (!mode) {
		return (
			<Center mih="100vh" miw="100vw" pos="relative" px="md">
				<Flex direction="column" gap="xxl" align="center" ta="center">
					<Stack align="center" gap="xxxs">
						<AppName size="lg" />

						<Title order={4}>
							Save it now. Read it later. Your inbox for the internet.
						</Title>
					</Stack>

					<Stack>
						<Button size="md" onClick={() => void handleChangeAuthMode('signup')}>
							Create account
						</Button>
						<Button
							size="md"
							variant="light"
							onClick={() => void handleChangeAuthMode('login')}
						>
							Sign In
						</Button>

						<Anchor
							variant="transparent"
							size="compact-md"
							c="dark"
							mt="xs"
							onClick={() => void handleChangeAuthMode('demo')}
							component="button"
						>
							Just curious? Try the demo first!
						</Anchor>
					</Stack>

					<Box
						pos="absolute"
						bottom={0}
						left={0}
						right={0}
						mx="auto"
						className={classes.loginFooter}
					>
						<Divider />

						<Group p="md" pt="xxs" justify="center">
							<Anchor fz="sm">About</Anchor>
							<Anchor fz="sm">Docs</Anchor>
							<Anchor fz="sm">Privacy</Anchor>
							<Anchor fz="sm">Terms</Anchor>
							<Anchor fz="sm">Roadmap</Anchor>
						</Group>
					</Box>
				</Flex>
			</Center>
		);
	}

	let title = '';
	let description = '';
	switch (mode) {
		case 'login':
			title = 'Sign In';
			description = 'Enter your username and password';
			break;

		case 'signup':
			title = 'Create Account';
			description = 'Start saving and reading your favorite content today';
			break;

		case 'forgot-password':
			title = 'Forgot Password';
			description = "Let's get your password reset!";
			break;

		case 'demo':
			title = 'Demo Account';
			description = 'Not sure if you will like it? Try it now!';
			break;
	}

	return (
		<Flex mih="100vh">
			<Box p={42} pb={160} className={classes.headerContainer} visibleFrom="sm">
				<Stack justify="flex-end" align="flex-end" ta="end" gap="xs">
					<Title size={54} c="blue" fw={800}>
						{title}
					</Title>
					<Text fz="lg" fw={500} c="gray.7">
						{description}
					</Text>
				</Stack>
			</Box>

			<Box className={classes.formContainer}>
				<Stack maw={560} w="100%">
					<Title order={2} c="blue" hiddenFrom="sm">
						{title}
					</Title>

					{mode === 'signup' && (
						<FormCreateAccount handleChangeAuthMode={handleChangeAuthMode} />
					)}
					{mode === 'login' && <FormLogin handleChangeAuthMode={handleChangeAuthMode} />}
					{mode === 'forgot-password' && (
						<FormForgotPassword handleChangeAuthMode={handleChangeAuthMode} />
					)}
					{mode === 'demo' && <DemoLogin handleChangeAuthMode={handleChangeAuthMode} />}
				</Stack>
			</Box>
		</Flex>
	);
};
