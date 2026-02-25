import {
	Box,
	Button,
	Card,
	Group,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useState, useEffect } from 'react';

import { setApiToken } from '@/utils/token';
import { getAppUrl, setAppUrl } from '@/utils/url';

interface ApiTokenSetupProps {
	onTokenSaved: () => void;
}

export const ApiTokenSetup = ({ onTokenSaved }: ApiTokenSetupProps) => {
	const [token, setToken] = useState('');
	const [appUrl, setAppUrlState] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getAppUrl().then((url) => {
			if (url) {
				setAppUrlState(url);
			}
		});
	}, []);

	const handleSave = async () => {
		if (!token.trim()) {
			setError('Please enter a valid API token');
			return;
		}

		if (!appUrl.trim()) {
			setError('Please enter a valid App URL');
			return;
		}

		setSaving(true);
		setError(null);

		try {
			await setAppUrl(appUrl.trim());
			await setApiToken(token.trim());
			onTokenSaved();
		} catch (err: any) {
			setError(err?.message ?? 'Failed to save settings');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box style={{ width: 420 }} p="md">
			<Stack>
				<Card>
					<Stack>
						<Group justify="space-between">
							<Title order={5}>Connect your Inboxt instance</Title>
						</Group>

						<Text size="sm" c="dimmed">
							To save content from your browser, you need to configure your App URL
							and an API token.
						</Text>

						<TextInput
							label="App URL"
							placeholder="https://your-inboxt-instance.com"
							description="The URL of your Inboxt instance"
							value={appUrl}
							onChange={(e) => setAppUrlState(e.currentTarget.value)}
							size="sm"
						/>

						<PasswordInput
							label="API Token"
							placeholder="Paste your API token here"
							value={token}
							onChange={(e) => setToken(e.currentTarget.value)}
							error={error}
							size="sm"
						/>

						<Group justify="right">
							<Button onClick={handleSave} loading={saving}>
								Save settings
							</Button>
						</Group>
					</Stack>
				</Card>
			</Stack>
		</Box>
	);
};
