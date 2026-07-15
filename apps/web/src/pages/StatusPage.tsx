import { Center, Stack, Title, Text, Button, Group } from '@mantine/core';
import { IconAlertTriangle, IconArrowLeft, IconFileOff, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';

interface StatusPageProps {
	icon: ReactNode;
	title: string;
	description: string;
	error?: Error;
	actions: ReactNode;
}

function StatusPage({ icon, title, description, error, actions }: StatusPageProps) {
	return (
		<Center h="100vh" p="md">
			<Stack gap="md" align="center" ta="center">
				{icon}

				<Title order={2}>{title}</Title>

				<Text c="dimmed" maw={360}>
					{description}
				</Text>

				{error && import.meta.env.DEV && (
					<Text c="red" size="sm">
						{error.message}
					</Text>
				)}

				<Group mt="md" justify="center">
					{actions}
				</Group>
			</Stack>
		</Center>
	);
}

export function NotFound() {
	const navigate = useNavigate();

	return (
		<StatusPage
			icon={<IconFileOff size={48} stroke={1.5} opacity={0.4} />}
			title="Nothing here"
			description="This page doesn’t exist or may have been moved."
			actions={
				<>
					<Button
						variant="subtle"
						leftSection={<IconArrowLeft size={16} />}
						onClick={() => window.history.back()}
					>
						Go back
					</Button>

					<Button onClick={() => navigate({ to: '/' })}>Go to inbox</Button>
				</>
			}
		/>
	);
}

export function AppError({ error }: { error: Error }) {
	const navigate = useNavigate();

	return (
		<StatusPage
			icon={<IconAlertTriangle size={48} stroke={1.5} opacity={0.4} />}
			title="Something went wrong"
			description="An unexpected error occurred. You can try again or return to your inbox."
			error={error}
			actions={
				<>
					<Button
						variant="subtle"
						leftSection={<IconRefresh size={16} />}
						onClick={() => window.location.reload()}
					>
						Refresh
					</Button>

					<Button onClick={() => navigate({ to: '/' })}>Go to inbox</Button>
				</>
			}
		/>
	);
}
