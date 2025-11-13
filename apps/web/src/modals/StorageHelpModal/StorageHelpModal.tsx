import { Alert, Button, Card, List, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconInfoCircle, IconTrash } from '@tabler/icons-react';

import { ButtonContainer } from '~components/ButtonContainer';

export const StorageHelpModal = ({ id, context }: ContextModalProps) => {
	return (
		<Stack flex={1}>
			<Alert color="gray" icon={<IconInfoCircle size={18} />}>
				Once you reach your storage limit, adding new items is paused, incoming newsletters
				won’t be processed, and imports may not complete. Free up space to restore full
				functionality.
			</Alert>

			<Card>
				<Stack gap="sm">
					<Text size="sm">Running low on storage? Try these steps:</Text>

					<List spacing="xs" size="sm" icon={<IconTrash size={16} />}>
						<List.Item>Delete saved items you no longer need</List.Item>
						<List.Item>Remove old newsletters</List.Item>
						<List.Item>Clear unwanted highlights</List.Item>
					</List>

					<Text size="sm" c="dimmed">
						Need more space? Contact us and we’ll review your usage and may increase
						your limit.
					</Text>
				</Stack>
			</Card>

			<ButtonContainer mt="auto">
				<Button variant="default" onClick={() => context.closeModal(id)}>
					Close
				</Button>

				<Button component="a" href="mailto:support@inboxt.app" variant="light">
					Contact support
				</Button>
			</ButtonContainer>
		</Stack>
	);
};
