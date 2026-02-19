import { Box, Button, Center, Flex, Group, Stack, Text, Title } from '@mantine/core';
import { useNavigate, useLocation, useSearch } from '@tanstack/react-router';

import { AppName } from '~components/AppName';
import { FooterLinks } from '~components/FooterLinks';
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

					<Stack miw={220}>
						<Button size="md" onClick={() => handleChangeAuthMode('signup')}>
							Create account
						</Button>
						<Button
							size="md"
							variant="light"
							onClick={() => handleChangeAuthMode('login')}
						>
							Sign In
						</Button>
					</Stack>

					<Box
						pos="absolute"
						bottom={0}
						left={0}
						right={0}
						mx="auto"
						className={classes.loginFooter}
					>
						<Group p="md" pt="xxs" justify="center">
							<FooterLinks separator="" position="center" />
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
	}

	return (
		<Flex mih="100vh">
			<Box p={42} pb={160} className={classes.headerContainer} visibleFrom="sm">
				<Stack justify="flex-end" align="flex-end" ta="end" gap="xs">
					<Title size={54} c="primary" fw={800}>
						{title}
					</Title>
					<Text fz="lg" fw={500} c="dimmed">
						{description}
					</Text>
				</Stack>
			</Box>

			<Box className={classes.formContainer}>
				<Stack maw={560} w="100%">
					<Title order={2} c="primary" hiddenFrom="sm">
						{title}
					</Title>

					{mode === 'signup' && (
						<FormCreateAccount handleChangeAuthMode={handleChangeAuthMode} />
					)}
					{mode === 'login' && <FormLogin handleChangeAuthMode={handleChangeAuthMode} />}
					{mode === 'forgot-password' && (
						<FormForgotPassword handleChangeAuthMode={handleChangeAuthMode} />
					)}
				</Stack>
			</Box>
		</Flex>
	);
};
