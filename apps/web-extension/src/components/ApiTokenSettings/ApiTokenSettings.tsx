import {
	Alert,
	Box,
	Button,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { IconCheck, IconExternalLink } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

import { graphqlFetch } from '@/utils/graphql';
import { getApiToken, setApiToken } from '@/utils/token';

const ME_QUERY = `
  query Me {
    me {
      id
    }
  }
`;

type TokenStatus = 'loading' | 'valid' | 'invalid' | 'missing';

interface ApiTokenSettingsProps {
	onBack: () => void;
}

export const ApiTokenSettings = ({ onBack }: ApiTokenSettingsProps) => {
	const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
	const [isEditing, setIsEditing] = useState(false);
	const [newToken, setNewToken] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const validateToken = async () => {
		setTokenStatus('loading');
		try {
			const token = await getApiToken();

			if (!token) {
				setTokenStatus('missing');
				return;
			}

			await graphqlFetch<{ me: { id: string } }>(ME_QUERY);
			setTokenStatus('valid');
		} catch (err) {
			setTokenStatus('invalid');
		}
	};

	useEffect(() => {
		void validateToken();
	}, []);

	const handleSave = async () => {
		if (!newToken.trim()) {
			setError('Please enter a valid API token');
			return;
		}

		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			await setApiToken(newToken.trim());
			await validateToken();
			setIsEditing(false);
			setNewToken('');
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err: any) {
			setError(err?.message ?? 'Failed to save token');
		} finally {
			setSaving(false);
		}
	};

	const getStatusText = () => {
		switch (tokenStatus) {
			case 'loading':
				return 'Validating...';
			case 'valid':
				return '✓ Token valid';
			case 'invalid':
				return '✗ Token invalid';
			case 'missing':
				return 'No token configured';
		}
	};

	const getStatusColor = () => {
		switch (tokenStatus) {
			case 'valid':
				return 'green';
			case 'invalid':
				return 'red';
			default:
				return 'dimmed';
		}
	};

	return (
		<Box style={{ width: 420 }} p="md">
			<Stack gap="md">
				<Group justify="space-between">
					<Title order={4}>API Token Settings</Title>
					<Button variant="subtle" size="xs" onClick={onBack}>
						Back
					</Button>
				</Group>

				{success && (
					<Alert color="green" icon={<IconCheck size={16} />}>
						API token updated successfully!
					</Alert>
				)}

				<Card>
					<Stack gap="sm">
						<Group justify="space-between" align="center">
							<Stack gap={2}>
								<Text size="sm" fw={500}>
									Current Status
								</Text>
								<Group gap="xs">
									{tokenStatus === 'loading' && <Loader size="xs" />}
									<Text size="xs" c={getStatusColor()}>
										{getStatusText()}
									</Text>
								</Group>
							</Stack>

							{!isEditing && tokenStatus !== 'loading' && (
								<Button
									size="xs"
									variant="light"
									onClick={() => setIsEditing(true)}
								>
									{tokenStatus === 'missing' ? 'Add Token' : 'Update Token'}
								</Button>
							)}
						</Group>
					</Stack>
				</Card>

				{isEditing && (
					<Card>
						<Stack gap="sm">
							<TextInput
								label="New API Token"
								placeholder="Paste your new API token here"
								value={newToken}
								onChange={(e) => setNewToken(e.currentTarget.value)}
								error={error}
								size="sm"
							/>

							<Group gap="xs">
								<Button onClick={handleSave} loading={saving} size="xs">
									Save Token
								</Button>
								<Button
									variant="default"
									size="xs"
									onClick={() => {
										setIsEditing(false);
										setNewToken('');
										setError(null);
									}}
								>
									Cancel
								</Button>
							</Group>
						</Stack>
					</Card>
				)}

				<Card>
					<Stack gap="sm">
						<Text size="sm" fw={500}>
							Manage API Tokens
						</Text>

						<Text size="xs" c="dimmed">
							Create, view, and delete your API tokens in the web app.
						</Text>

						<Button
							variant="light"
							size="xs"
							leftSection={<IconExternalLink size={14} />}
							onClick={() => {
								browser.tabs.create({
									url: `${import.meta.env!.VITE_WEB_URL}?modal=api-tokens`,
								});
								window.close();
							}}
						>
							Open Token Management
						</Button>
					</Stack>
				</Card>
			</Stack>
		</Box>
	);
};
