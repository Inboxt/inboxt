import { Center, Stack, Title, Text, Button, Group } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function AppError({ error }: { error: Error }) {
	const navigate = useNavigate();

	return (
		<Center h="100vh">
			<Stack gap="md" align="center" ta="center">
				<IconAlertTriangle size={48} stroke={1.5} opacity={0.4} />

				<Title order={2}>Something went wrong</Title>

				<Text c="dimmed" maw={360}>
					An unexpected error occurred. You can try again or return to your inbox.
				</Text>

				{import.meta.env.DEV && (
					<Text c="red" size="sm">
						{error.message}
					</Text>
				)}

				<Group mt="md">
					<Button
						variant="subtle"
						leftSection={<IconRefresh size={16} />}
						onClick={() => window.location.reload()}
					>
						Refresh
					</Button>

					<Button onClick={() => navigate({ to: '/' })}>Go to inbox</Button>
				</Group>
			</Stack>
		</Center>
	);
}
