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
import { useState } from 'react';

import classes from './Login.module.css';

import { FormCreateAccount } from '../../forms/FormCreateAccount.tsx';
import { FormLogin } from '../../forms/FormLogin.tsx';
import { AppName } from '../../components/AppName';
import { FormForgotPassword } from '../../forms/FormForgotPassword.tsx';
import { DemoLogin } from '../../components/DemoLogin';
import { modals } from '@modals/modals.ts';

type LoginView =
	| 'login'
	| 'create-account'
	| 'start-demo'
	| 'forgot-password'
	| null;

export type LoginViewProps = {
	handleLoginViewChange: (view: LoginView) => void;
};

// todo: include "Page" in name of a component that is part of the /pages directory?
export const Login = () => {
	const [loginView, setLoginView] = useState<LoginView>();

	const handleLoginViewChange = (view: LoginView) => {
		setLoginView(view);
	};

	if (!loginView) {
		return (
			<Center mih="100vh" miw="100vw" pos="relative">
				<Flex direction="column" gap="lg" align="center">
					<AppName size="md" />

					<Stack>
						<Button
							size="md"
							onClick={() => setLoginView('create-account')}
						>
							Create account
						</Button>
						<Button
							size="md"
							variant="light"
							onClick={() => setLoginView('login')}
						>
							Sign In
						</Button>

						<Button
							variant="transparent"
							size="compact-md"
							color="dark"
							mt="xs"
							onClick={() => setLoginView('start-demo')}
						>
							Try the app in demo mode!
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
						<Divider />

						<Group p="md" pt="xxs" justify="center">
							<Anchor fz="sm">About</Anchor>
							<Anchor fz="sm">Docs</Anchor>
							<Anchor fz="sm">Privacy</Anchor>
							<Anchor fz="sm">Terms</Anchor>
							<Anchor
								fz="sm"
								onClick={() => modals.openPlanModal(false)}
							>
								Pricing
							</Anchor>
						</Group>
					</Box>
				</Flex>
			</Center>
		);
	}

	let title = '';
	let description = '';
	switch (loginView) {
		case 'login':
			title = 'Sign In';
			description = 'Enter your username and password';
			break;

		case 'create-account':
			title = 'Create Account';
			description =
				'Start saving and reading your favorite content today';
			break;

		case 'forgot-password':
			title = 'Forgot Password';
			description = "Let's get your password reset!";
			break;

		case 'start-demo':
			title = 'Demo Account';
			description = 'Not sure if you will like it? Try it now!';
			break;
	}

	return (
		<Flex mih="100vh">
			<Box
				bg="gray.1"
				p={42}
				pb={160}
				className={classes.headerContainer}
				visibleFrom="sm"
			>
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

					{loginView === 'create-account' && (
						<FormCreateAccount
							handleLoginViewChange={handleLoginViewChange}
						/>
					)}
					{loginView === 'login' && (
						<FormLogin
							handleLoginViewChange={handleLoginViewChange}
						/>
					)}
					{loginView === 'forgot-password' && (
						<FormForgotPassword
							handleLoginViewChange={handleLoginViewChange}
						/>
					)}
					{loginView === 'start-demo' && (
						<DemoLogin
							handleLoginViewChange={handleLoginViewChange}
						/>
					)}
				</Stack>
			</Box>
		</Flex>
	);
};
