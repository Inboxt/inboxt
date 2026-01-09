import { Box, Button, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';

import { setApiToken } from '@/utils/token';

interface ApiTokenSetupProps {
	onTokenSaved: () => void;
}

export const ApiTokenSetup = ({ onTokenSaved }: ApiTokenSetupProps) => {
	const [token, setToken] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		if (!token.trim()) {
			setError('Please enter a valid API token');
			return;
		}

		setSaving(true);
		setError(null);

		try {
			await setApiToken(token.trim());
			onTokenSaved();
		} catch (err: any) {
			setError(err?.message ?? 'Failed to save token');
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
							<Title order={5}>Connect your Inboxt account</Title>
						</Group>

						<Text size="sm" c="dimmed">
							To save content from your browser, you need to configure an API token.
							This allows the extension to securely communicate with your Inboxt
							account.
						</Text>

						<TextInput
							label="API Token"
							placeholder="Paste your API token here"
							value={token}
							onChange={(e) => setToken(e.currentTarget.value)}
							error={error}
							size="sm"
						/>

						<Group justify="space-between">
							<Button
								variant="default"
								onClick={() => {
									browser.tabs.create({
										url: `${import.meta.env!.VITE_WEB_URL}?modal=api-tokens`,
									});
									window.close();
								}}
							>
								Manage API Tokens
							</Button>

							<Button onClick={handleSave} loading={saving}>
								Save token
							</Button>
						</Group>
					</Stack>
				</Card>
			</Stack>
		</Box>
	);
};
