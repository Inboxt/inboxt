import { Center, Stack, Title, Text, Button, Group } from '@mantine/core';
import { IconFileOff, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function NotFound() {
	const navigate = useNavigate();

	return (
		<Center h="100vh">
			<Stack gap="md" align="center" ta="center">
				<IconFileOff size={48} stroke={1.5} opacity={0.4} />

				<Title order={2}>Nothing here</Title>

				<Text c="dimmed" maw={360}>
					This page doesn’t exist or may have been moved.
				</Text>

				<Group mt="md">
					<Button
						variant="subtle"
						leftSection={<IconArrowLeft size={16} />}
						onClick={() => window.history.back()}
					>
						Go back
					</Button>

					<Button onClick={() => navigate({ to: '/' })}>Go to inbox</Button>
				</Group>
			</Stack>
		</Center>
	);
}
