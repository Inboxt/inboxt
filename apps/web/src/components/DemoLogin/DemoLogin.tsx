import { useMutation } from '@apollo/client';
import { Anchor, Button, Divider, List, Stack, Switch, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';

import { ButtonContainer } from '~components/ButtonContainer';
import { CREATE_DEMO_ACCOUNT } from '~lib/graphql';
import { AuthViewProps } from '~pages/Auth/Auth';
import { Route } from '~routes/auth.route';

import { Form } from '../Form';

export const DemoLogin = ({ handleChangeAuthMode }: AuthViewProps) => {
	const [createDemoAccount, { loading, error }] = useMutation(CREATE_DEMO_ACCOUNT);
	const navigate = useNavigate({ from: Route.id });

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			hasAgreedToDemoLimitations: false,
		},
		validate: {
			hasAgreedToDemoLimitations: (value) =>
				!value ? 'Please agree to the demo account rules and limitations to proceed' : null,
		},
	});

	const handleCreateDemoAccount = async () => {
		await createDemoAccount();
		await navigate({ to: '/' });
	};

	return (
		<Form onSubmit={form.onSubmit(handleCreateDemoAccount)} error={error}>
			{({ error }) => (
				<Stack>
					{error}

					<Text>
						Explore the app with a fully accessible demo account! Please keep the
						following in mind:
					</Text>

					<List type="ordered" style={{ listStylePosition: 'outside' }}>
						<List.Item>
							<b>Shared Access</b>: The demo account is public, meaning it’s
							accessible to other users. We strongly advise against sharing or saving
							any personal or sensitive information while using it.
						</List.Item>

						<List.Item>
							<b>Data Limitations</b>: The account is limited to storing a maximum of
							XX items. If the limit has already been reached, you may encounter
							restrictions on saving new items. In this case, feel free to check back
							later.
						</List.Item>

						<List.Item>
							<b>Daily Reset</b>: To ensure a fresh start for all users, the demo
							account is cleared daily at 1:00 AM. During this time, the account may
							be temporarily unavailable as we clean up old data and reload default
							content.
						</List.Item>

						<List.Item>
							<b>Unavailable Features</b>: Some features are disabled in the demo
							version to ensure the app remains accessible and usable for all users.
							These include:
							<List withPadding listStyleType="disc">
								<List.Item>
									<b>Newsletters</b>: Creating special email newsletters,
									retrieving email addresses from the app, or accessing them via
									the app.
								</List.Item>

								<List.Item>
									<b>Data Import/Export</b>: The ability to upload or download any
									data to/from the app.
								</List.Item>
							</List>
						</List.Item>
					</List>

					<Switch
						label="I understand and agree to the demo account limitations."
						size="md"
						mt="xxl"
						key={form.key('hasAgreedToDemoLimitations')}
						{...form.getInputProps('hasAgreedToDemoLimitations', {
							type: 'checkbox',
						})}
					/>

					<ButtonContainer mt="md">
						<Button
							variant="default"
							size="md"
							onClick={() => handleChangeAuthMode(undefined)}
						>
							Back
						</Button>

						<Button size="md" type="submit" loading={loading}>
							Continue
						</Button>
					</ButtonContainer>

					<Divider my="xxs" />

					<Text fz="sm">
						Have more questions? <Anchor fz="sm">Contact support</Anchor>
					</Text>
				</Stack>
			)}
		</Form>
	);
};
